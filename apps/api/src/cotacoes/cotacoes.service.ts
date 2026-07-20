import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { CotacaoStatus, ParticipacaoCotacaoStatus, Prisma } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type { CadastrarFornecedorCotacaoDto, CriarCotacaoInteligenteDto, EncerrarCotacaoDto, FinalizarCotacaoDto, ProrrogarCotacaoDto, RecusarCotacaoDto, RegistrarRespostaCotacaoDto, RespostaPublicaCotacaoDto } from "./cotacoes.dto.js";

const n = (valor: unknown) => Number(valor || 0);
const limpo = (valor?: string | null) => valor?.trim() || null;
const telefoneLimpo = (valor?: string | null) => (valor || "").replace(/\D/g, "");
const dataOuNull = (valor?: string | null) => valor ? new Date(valor) : null;
const encerrada = (status: CotacaoStatus) => ([CotacaoStatus.FINALIZADA, CotacaoStatus.ENCERRADA, CotacaoStatus.CANCELADA] as CotacaoStatus[]).includes(status);

@Injectable()
export class CotacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async painel() {
    const agora = new Date();
    await this.prisma.$transaction([
      this.prisma.cotacaoFornecedor.updateMany({ where: { tokenValidoAte: { lt: agora }, status: { in: [ParticipacaoCotacaoStatus.LINK_NAO_ENVIADO, ParticipacaoCotacaoStatus.ENVIADO, ParticipacaoCotacaoStatus.LINK_ACESSADO, ParticipacaoCotacaoStatus.FORMULARIO_INICIADO, ParticipacaoCotacaoStatus.RASCUNHO_SALVO] } }, data: { status: ParticipacaoCotacaoStatus.VENCIDO } }),
      this.prisma.cotacao.updateMany({ where: { prazoResposta: { lt: agora }, status: { in: [CotacaoStatus.AGUARDANDO, CotacaoStatus.ENVIADA] } }, data: { status: CotacaoStatus.VENCIDA } }),
    ]);
    const [insumos, cotacoes, fornecedores, pedidos] = await Promise.all([
      this.prisma.insumo.findMany({ where: { ativo: true }, include: { ultimoFornecedor: true, historicoPrecos: { orderBy: { criadoEm: "desc" }, take: 1 } }, orderBy: { nome: "asc" } }),
      this.prisma.cotacao.findMany({ include: this.incluirCotacao(), orderBy: { criadoEm: "desc" }, take: 50 }),
      this.prisma.fornecedor.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
      this.prisma.pedidoCompra.findMany({ include: { fornecedor: true, itens: { include: { insumo: true } }, cotacao: true, recebimentos: true }, orderBy: { criadoEm: "desc" }, take: 50 }),
    ]);
    const sugestoes = insumos.map(item => {
      const atual = Number(n(item.quantidade).toFixed(3)), minimo = Number(n(item.estoqueMinimo).toFixed(3)), quantidadeSugerida = Number(Math.max(0, minimo - atual).toFixed(3)), ultimo = item.historicoPrecos[0];
      return { id: item.id, codigo: item.codigo, nome: item.nome, categoria: item.categoria, unidade: item.unidade, estoqueAtual: atual, estoqueMinimo: minimo, quantidadeSugerida, ultimoValorCompra: ultimo ? n(ultimo.precoUnitario) : n(item.ultimoCustoCompra ?? item.custoUnitario), ultimoFornecedor: item.ultimoFornecedor?.nome || null, ultimaCompraEm: item.ultimaCompraEm, custoEstimado: quantidadeSugerida * n(item.custoUnitario), prioridade: atual <= 0 ? "critica" : atual < minimo * 0.5 ? "alta" : "normal" };
    }).filter(item => item.estoqueMinimo > 0 && item.estoqueAtual < item.estoqueMinimo);
    const apresentadas = cotacoes.map(item => this.apresentar(item));
    return { atualizadoEm: agora, sugestoes, cotacoes: apresentadas, pedidos: pedidos.map(item => this.apresentarPedido(item)), fornecedores: fornecedores.map(f => ({ id: f.id, nome: f.nome, telefone: f.whatsapp || f.telefone, cnpj: f.cnpj, categoria: f.categoria, formaPagamento: f.formaPagamento, prazoPagamento: f.prazoPagamento })), indicadores: { abaixoMinimo: sugestoes.length, aguardandoResposta: apresentadas.filter(item => ["aguardando", "enviada"].includes(item.status)).length, finalizadas: apresentadas.filter(item => item.status === "finalizada").length, pedidosAguardando: pedidos.filter(item => !["RECEBIDO", "CANCELADO"].includes(item.status)).length, economiaAcumulada: apresentadas.reduce((total, item) => total + n(item.economiaTotal), 0) } };
  }

  async listarFornecedores() {
    const itens = await this.prisma.fornecedor.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } });
    return { data: itens.map(item => ({ id: item.id, nome: item.nome, telefone: item.whatsapp || item.telefone, cnpj: item.cnpj, categoria: item.categoria })) };
  }

  async cadastrarFornecedor(dto: CadastrarFornecedorCotacaoDto) {
    const telefone = telefoneLimpo(dto.telefone);
    if (telefone.length < 10) throw new BadRequestException("Informe o WhatsApp com DDD e número.");
    const cnpj = dto.cnpj?.replace(/\D/g, "") || null;
    const existente = cnpj ? await this.prisma.fornecedor.findUnique({ where: { cnpj } }) : null;
    const item = existente ? await this.prisma.fornecedor.update({ where: { id: existente.id }, data: { nome: dto.nome.trim(), telefone, whatsapp: telefone, ativo: true } }) : await this.prisma.fornecedor.create({ data: { nome: dto.nome.trim(), telefone, whatsapp: telefone, cnpj } });
    return { id: item.id, nome: item.nome, telefone: item.whatsapp || item.telefone, cnpj: item.cnpj };
  }

  async criar(dto: CriarCotacaoInteligenteDto, usuarioId?: string) {
    const entradas = dto.itens?.length ? dto.itens : dto.insumoCodigo ? [{ insumoCodigo: dto.insumoCodigo, quantidade: dto.quantidade || 0 }] : [];
    if (!entradas.length) throw new BadRequestException("Selecione ao menos um produto para a cotação.");
    if (new Set(entradas.map(item => item.insumoCodigo)).size !== entradas.length) throw new BadRequestException("O mesmo produto não pode aparecer duas vezes na cotação.");
    const fornecedorIds = [...new Set(dto.fornecedorIds)];
    const [insumos, fornecedores] = await Promise.all([this.prisma.insumo.findMany({ where: { codigo: { in: entradas.map(item => item.insumoCodigo) }, ativo: true } }), this.prisma.fornecedor.findMany({ where: { id: { in: fornecedorIds }, ativo: true } })]);
    if (insumos.length !== entradas.length) throw new BadRequestException("Um ou mais produtos não estão disponíveis no estoque.");
    if (fornecedores.length !== fornecedorIds.length) throw new BadRequestException("Um ou mais fornecedores não estão disponíveis.");
    const semWhatsapp = fornecedores.filter(item => !telefoneLimpo(item.whatsapp || item.telefone));
    if (semWhatsapp.length) throw new BadRequestException("Cadastre o WhatsApp de: " + semWhatsapp.map(item => item.nome).join(", ") + ".");
    const prazo = dto.prazoResposta ? new Date(dto.prazoResposta) : new Date(Date.now() + 3 * 86400000);
    if (prazo <= new Date()) throw new BadRequestException("O prazo de resposta deve estar no futuro.");
    const porCodigo = new Map(insumos.map(item => [item.codigo, item])), primeiro = porCodigo.get(entradas[0].insumoCodigo)!;
    const codigo = await this.proximoCodigo("COT"), tokens = new Map(fornecedores.map(item => [item.id, randomBytes(32).toString("base64url")]));
    const cotacaoId = await this.prisma.$transaction(async tx => {
      const itens = entradas.map(entrada => { const insumo = porCodigo.get(entrada.insumoCodigo)!; const quantidade = entrada.quantidade || Math.max(0, n(insumo.estoqueMinimo) - n(insumo.quantidade)); if (quantidade <= 0) throw new BadRequestException("Informe uma quantidade positiva para " + insumo.nome + "."); return { insumoId: insumo.id, quantidadeSolicitada: quantidade, unidade: insumo.unidade, marcaPreferencial: limpo(entrada.marcaPreferencial), embalagemSolicitada: limpo(entrada.embalagemSolicitada), observacoes: limpo(entrada.observacoes), dataDesejadaEntrega: dataOuNull(entrada.dataDesejadaEntrega), ultimoPreco: insumo.ultimoCustoCompra ?? insumo.custoUnitario }; });
      const cotacao = await tx.cotacao.create({ data: { codigo, descricao: entradas.length === 1 ? primeiro.nome : entradas.length + " produtos para compra", quantidade: itens[0].quantidadeSolicitada, unidade: primeiro.unidade, insumoCodigo: primeiro.codigo, estoqueAtual: primeiro.quantidade, estoqueMinimo: primeiro.estoqueMinimo, saldoCaixa: dto.saldoCaixa, prazoResposta: prazo, observacoes: limpo(dto.observacoes), itens: { create: itens }, propostas: { create: fornecedores.map(fornecedor => ({ fornecedorId: fornecedor.id, tokenPublico: tokens.get(fornecedor.id), tokenValidoAte: prazo })) } }, include: { itens: true, propostas: true } });
      await tx.cotacaoItemProposta.createMany({ data: cotacao.propostas.flatMap(participacao => cotacao.itens.map(item => ({ participacaoId: participacao.id, cotacaoItemId: item.id }))) });
      await tx.compraAuditoria.create({ data: { entidade: "COTACAO", entidadeId: cotacao.id, acao: "CRIADA", usuarioId, detalhes: { codigo, itens: cotacao.itens.length, fornecedores: cotacao.propostas.length } } });
      return cotacao.id;
    });
    return this.apresentar(await this.prisma.cotacao.findUniqueOrThrow({ where: { id: cotacaoId }, include: this.incluirCotacao() }));
  }

  async buscar(codigo: string) {
    const cotacao: any = await this.prisma.cotacao.findUnique({ where: { codigo }, include: this.incluirCotacao() });
    if (!cotacao) throw new NotFoundException("Cotação não encontrada.");
    return this.apresentar(cotacao);
  }

  async obterPublica(token: string, ip?: string, userAgent?: string) {
    const participacao = await this.carregarPublica(token); this.validarToken(participacao);
    await this.prisma.$transaction(async tx => { await tx.cotacaoAcesso.create({ data: { participacaoId: participacao.id, ip: limpo(ip), userAgent: limpo(userAgent) } }); if (([ParticipacaoCotacaoStatus.LINK_NAO_ENVIADO, ParticipacaoCotacaoStatus.ENVIADO] as ParticipacaoCotacaoStatus[]).includes(participacao.status)) await tx.cotacaoFornecedor.update({ where: { id: participacao.id }, data: { status: ParticipacaoCotacaoStatus.LINK_ACESSADO, acessadaEm: participacao.acessadaEm || new Date() } }); });
    return this.apresentarPublica(await this.carregarPublica(token));
  }

  async salvarRascunho(token: string, dto: RespostaPublicaCotacaoDto, ip?: string) { const p = await this.carregarPublica(token); this.validarToken(p, true); await this.gravarResposta(p, dto, false, ip); return this.apresentarPublica(await this.carregarPublica(token)); }
  async enviarRespostaPublica(token: string, dto: RespostaPublicaCotacaoDto, ip?: string) { const p = await this.carregarPublica(token); this.validarToken(p, true); await this.gravarResposta(p, dto, true, ip); return { mensagem: "Cotação enviada com sucesso. A empresa recebeu sua proposta.", proposta: this.apresentarPublica(await this.carregarPublica(token)) }; }
  async recusar(token: string, dto: RecusarCotacaoDto, ip?: string) {
    const p = await this.carregarPublica(token); this.validarToken(p, true);
    await this.prisma.$transaction([this.prisma.cotacaoFornecedor.update({ where: { id: p.id }, data: { status: ParticipacaoCotacaoStatus.RECUSADO, recusadaEm: new Date(), motivoRecusa: dto.motivo, detalheRecusa: limpo(dto.detalhe), bloqueada: true, ipResposta: limpo(ip) } }), this.prisma.compraAuditoria.create({ data: { entidade: "COTACAO_FORNECEDOR", entidadeId: p.id, acao: "RECUSADA", detalhes: { motivo: dto.motivo, detalhe: dto.detalhe } } })]);
    return { mensagem: "Recusa registrada. Obrigado pelo retorno." };
  }

  async registrarResposta(codigo: string, dto: RegistrarRespostaCotacaoDto) {
    const cotacao: any = await this.prisma.cotacao.findUnique({ where: { codigo }, include: { propostas: true } }); if (!cotacao) throw new NotFoundException("Cotação não encontrada.");
    const proposta = cotacao.propostas.find((item: any) => item.fornecedorId === dto.fornecedorId); if (!proposta) throw new BadRequestException("Fornecedor não participa desta cotação.");
    await this.prisma.$transaction([this.prisma.cotacaoFornecedor.update({ where: { id: proposta.id }, data: { precoUnitario: dto.precoUnitario, frete: dto.frete ?? 0, prazoDias: dto.prazoDias, condicoes: dto.condicoes ?? dto.formaPagamento, formaPagamento: dto.formaPagamento ?? dto.condicoes, impostoIncluso: dto.impostoIncluso, origemResposta: "MANUAL", respostaOriginal: dto.respostaOriginal, respondidaEm: new Date(), status: ParticipacaoCotacaoStatus.RESPONDIDO, bloqueada: true } }), this.prisma.cotacao.update({ where: { id: cotacao.id }, data: { status: CotacaoStatus.RESPONDIDA } })]);
    return this.buscar(codigo);
  }

  async enviarWhatsapp(codigo: string) {
    const cotacao: any = await this.prisma.cotacao.findUnique({ where: { codigo }, include: this.incluirCotacao() });
    if (!cotacao) throw new NotFoundException("Cotação não encontrada.");
    if (encerrada(cotacao.status)) throw new BadRequestException("Esta cotação já foi encerrada.");
    const configurada = Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_GRAPH_VERSION && process.env.WHATSAPP_COTACAO_TEMPLATE);
    const resultados: any[] = [];
    for (const proposta of cotacao.propostas) {
      if (!proposta.tokenPublico) continue;
      const destino = this.numeroWhatsapp(proposta.fornecedor.whatsapp || proposta.fornecedor.telefone);
      if (!destino) { resultados.push({ participacaoId: proposta.id, fornecedor: proposta.fornecedor.nome, enviada: false, erro: "WhatsApp não cadastrado" }); continue; }
      const link = this.linkPublico(proposta.tokenPublico), mensagem = this.mensagemWhatsapp(cotacao, proposta.fornecedor.nome, link);
      let enviada = false, mensagemId: string | undefined, erro: string | undefined;
      if (configurada) {
        try {
          const resposta = await fetch(`https://graph.facebook.com/${process.env.WHATSAPP_GRAPH_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, { method: "POST", headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify({ messaging_product: "whatsapp", to: destino, type: "template", template: { name: process.env.WHATSAPP_COTACAO_TEMPLATE, language: { code: "pt_BR" }, components: [{ type: "body", parameters: [{ type: "text", text: proposta.fornecedor.nome }, { type: "text", text: cotacao.codigo }, { type: "text", text: String(cotacao.itens.length || 1) }, { type: "text", text: this.dataHora(cotacao.prazoResposta) }] }, { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: proposta.tokenPublico }] }] } }) });
          const corpo = await resposta.json() as any; mensagemId = corpo.messages?.[0]?.id; enviada = resposta.ok && Boolean(mensagemId); if (!enviada) erro = corpo.error?.message || `HTTP ${resposta.status}`;
        } catch (error: any) { erro = error?.message || "Falha na API do WhatsApp"; }
      }
      const urlWhatsapp = `https://wa.me/${destino}?text=${encodeURIComponent(mensagem)}`;
      await this.prisma.cotacaoFornecedor.update({ where: { id: proposta.id }, data: { status: ParticipacaoCotacaoStatus.ENVIADO, enviadaEm: new Date(), numeroWhatsappEnvio: destino, ...(mensagemId ? { whatsappMensagemId: mensagemId } : {}) } });
      resultados.push({ participacaoId: proposta.id, fornecedor: proposta.fornecedor.nome, enviada, preparada: !enviada, mensagemId, erro, linkFormulario: link, urlWhatsapp });
    }
    await this.prisma.cotacao.update({ where: { id: cotacao.id }, data: { status: CotacaoStatus.ENVIADA } });
    return { codigo, modo: configurada ? "api_e_links" : "links_whatsapp", resultados };
  }

  async gerarNovoLink(codigo: string, participacaoId: string) {
    const cotacao: any = await this.prisma.cotacao.findUnique({ where: { codigo }, select: { id: true, prazoResposta: true, status: true } });
    if (!cotacao) throw new NotFoundException("Cotação não encontrada."); if (encerrada(cotacao.status)) throw new BadRequestException("A cotação está encerrada.");
    const existente = await this.prisma.cotacaoFornecedor.findUnique({ where: { id: participacaoId }, select: { cotacaoId: true } });
    if (!existente || existente.cotacaoId !== cotacao.id) throw new BadRequestException("Fornecedor nao pertence a esta cotacao.");
    const token = randomBytes(32).toString("base64url");
    const participacao = await this.prisma.cotacaoFornecedor.update({ where: { id: participacaoId }, data: { tokenPublico: token, tokenValidoAte: cotacao.prazoResposta || new Date(Date.now() + 3 * 86400000), tokenCanceladoEm: null, status: ParticipacaoCotacaoStatus.LINK_NAO_ENVIADO, bloqueada: false, versao: { increment: 1 } }, include: { fornecedor: true } });
    return { participacaoId, fornecedor: participacao.fornecedor.nome, linkFormulario: this.linkPublico(token) };
  }

  async prorrogar(codigo: string, dto: ProrrogarCotacaoDto, usuarioId?: string) {
    const prazo = new Date(dto.prazoResposta); if (prazo <= new Date()) throw new BadRequestException("O novo prazo deve estar no futuro.");
    const cotacao: any = await this.prisma.cotacao.findUnique({ where: { codigo } }); if (!cotacao) throw new NotFoundException("Cotação não encontrada.");
    await this.prisma.$transaction([this.prisma.cotacao.update({ where: { id: cotacao.id }, data: { prazoResposta: prazo, status: CotacaoStatus.ENVIADA } }), this.prisma.cotacaoFornecedor.updateMany({ where: { cotacaoId: cotacao.id, status: ParticipacaoCotacaoStatus.VENCIDO }, data: { status: ParticipacaoCotacaoStatus.ENVIADO, tokenValidoAte: prazo } }), this.prisma.compraAuditoria.create({ data: { entidade: "COTACAO", entidadeId: cotacao.id, acao: "PRAZO_PRORROGADO", usuarioId, detalhes: { prazo } } })]);
    return this.buscar(codigo);
  }

  async encerrar(codigo: string, dto: EncerrarCotacaoDto, usuarioId?: string) {
    const cotacao: any = await this.prisma.cotacao.findUnique({ where: { codigo } }); if (!cotacao) throw new NotFoundException("Cotação não encontrada.");
    await this.prisma.$transaction([this.prisma.cotacao.update({ where: { id: cotacao.id }, data: { status: CotacaoStatus.ENCERRADA, finalizadaEm: new Date(), motivoFinalizacao: limpo(dto.motivo), finalizadaPorId: usuarioId } }), this.prisma.cotacaoFornecedor.updateMany({ where: { cotacaoId: cotacao.id, status: { notIn: [ParticipacaoCotacaoStatus.RESPONDIDO, ParticipacaoCotacaoStatus.RECUSADO] } }, data: { status: ParticipacaoCotacaoStatus.CANCELADO, tokenCanceladoEm: new Date() } }), this.prisma.compraAuditoria.create({ data: { entidade: "COTACAO", entidadeId: cotacao.id, acao: "ENCERRADA", usuarioId, detalhes: { motivo: dto.motivo } } })]);
    return this.buscar(codigo);
  }

  async finalizar(codigo: string, dto: FinalizarCotacaoDto, usuarioId?: string) {
    const cotacao: any = await this.prisma.cotacao.findUnique({ where: { codigo }, include: this.incluirCotacao() });
    if (!cotacao) throw new NotFoundException("Cotação não encontrada."); if (encerrada(cotacao.status)) throw new BadRequestException("Esta cotação já está encerrada.");
    if (cotacao.itens.length !== dto.selecoes.length || new Set(dto.selecoes.map(item => item.cotacaoItemId)).size !== cotacao.itens.length) throw new BadRequestException("Escolha uma proposta vencedora para cada produto.");
    const escolhidas = dto.selecoes.map(selecao => { const item = cotacao.itens.find((x: any) => x.id === selecao.cotacaoItemId); const proposta = item?.propostas.find((x: any) => x.id === selecao.propostaItemId); if (!item || !proposta || !proposta.disponivel || proposta.precoUnitario == null) throw new BadRequestException("Uma das propostas escolhidas é inválida."); return { item, proposta, participacao: proposta.participacao }; });
    const exigeJustificativa = escolhidas.some(atual => n(atual.proposta.precoUnitario) > Math.min(...atual.item.propostas.filter((x: any) => x.disponivel && x.precoUnitario != null).map((x: any) => n(x.precoUnitario))));
    if (exigeJustificativa && !dto.justificativa?.trim()) throw new BadRequestException("Informe a justificativa para escolher uma proposta que nao tem o menor preco.");
    const economiaTotal = escolhidas.reduce((total, atual) => { const maior = atual.item.propostas.filter((x: any) => x.disponivel && x.precoUnitario != null).reduce((max: number, x: any) => Math.max(max, n(x.precoUnitario)), n(atual.proposta.precoUnitario)); return total + (maior - n(atual.proposta.precoUnitario)) * n(atual.item.quantidadeSolicitada); }, 0);
    const usuario = usuarioId ? await this.prisma.usuario.findUnique({ where: { id: usuarioId }, select: { nome: true } }) : null;
    const grupos = new Map<string, typeof escolhidas>(); for (const escolhida of escolhidas) grupos.set(escolhida.participacao.id, [...(grupos.get(escolhida.participacao.id) || []), escolhida]);
    const pedidos = await this.prisma.$transaction(async tx => {
      await tx.cotacaoItemProposta.updateMany({ where: { cotacaoItem: { cotacaoId: cotacao.id } }, data: { selecionada: false } }); await tx.cotacaoFornecedor.updateMany({ where: { cotacaoId: cotacao.id }, data: { selecionada: false } });
      const criados: any[] = []; let indice = 0;
      for (const grupo of grupos.values()) {
        indice += 1; const participacao = grupo[0].participacao, subtotal = grupo.reduce((total, atual) => total + n(atual.item.quantidadeSolicitada) * n(atual.proposta.precoUnitario), 0), frete = n(participacao.frete), desconto = n(participacao.desconto);
        const pedido = await tx.pedidoCompra.create({ data: { codigo: await this.proximoCodigo("PC", tx, indice), cotacaoId: cotacao.id, fornecedorId: participacao.fornecedorId, status: "GERADO", valorTotal: Math.max(0, subtotal + frete - desconto), frete, desconto, condicaoPagamento: participacao.condicoes, formaPagamento: participacao.formaPagamento, dataPrevistaEntrega: grupo.map(x => x.proposta.dataPrevistaEntrega).filter(Boolean).sort()[0] || null, responsavelCompra: usuario?.nome || null, observacoes: limpo(dto.justificativa), finalizadoEm: new Date(), itens: { create: grupo.map(atual => ({ insumoId: atual.item.insumoId, quantidade: atual.item.quantidadeSolicitada, unidade: atual.item.unidade, custoUnitario: atual.proposta.precoUnitario, marca: atual.proposta.marcaOferecida, embalagem: atual.proposta.embalagem, observacoes: atual.proposta.observacoes })) } }, include: { fornecedor: true, cotacao: true, itens: { include: { insumo: true } } } });
        const pdf = this.gerarPdfPedido(pedido); await tx.pedidoCompra.update({ where: { id: pedido.id }, data: { pdfArquivo: pdf, pdfNome: pedido.codigo + ".pdf", pdfGeradoEm: new Date() } }); await tx.cotacaoFornecedor.update({ where: { id: participacao.id }, data: { selecionada: true } }); for (const atual of grupo) await tx.cotacaoItemProposta.update({ where: { id: atual.proposta.id }, data: { selecionada: true } }); criados.push({ ...pedido, pdfDisponivel: true });
      }
      await tx.cotacao.update({ where: { id: cotacao.id }, data: { status: CotacaoStatus.FINALIZADA, finalizadaEm: new Date(), finalizadaPorId: usuarioId, motivoFinalizacao: limpo(dto.justificativa), economiaTotal } }); await tx.compraAuditoria.create({ data: { entidade: "COTACAO", entidadeId: cotacao.id, acao: "FINALIZADA", usuarioId, detalhes: { pedidos: criados.map(item => item.codigo), economiaTotal, justificativa: dto.justificativa } } }); return criados;
    });
    return { cotacao: await this.buscar(codigo), pedidos: pedidos.map(item => this.apresentarPedido(item)) };
  }

  async listarPedidos() { const pedidos = await this.prisma.pedidoCompra.findMany({ include: { fornecedor: true, cotacao: true, itens: { include: { insumo: true } }, recebimentos: { include: { itens: true } } }, orderBy: { criadoEm: "desc" } }); return { data: pedidos.map(item => this.apresentarPedido(item)) }; }
  async pdfPedido(id: string) { const pedido = await this.prisma.pedidoCompra.findUnique({ where: { id }, select: { codigo: true, pdfArquivo: true, pdfNome: true } }); if (!pedido?.pdfArquivo) throw new NotFoundException("PDF do pedido não encontrado."); return { arquivo: Buffer.from(pedido.pdfArquivo), nome: pedido.pdfNome || pedido.codigo + ".pdf" }; }

  validarAssinatura(rawBody: Buffer | undefined, assinatura: string | undefined) {
    const appSecret = process.env.WHATSAPP_APP_SECRET; if (!appSecret || !rawBody || !assinatura) throw new UnauthorizedException("Assinatura do webhook ausente.");
    const esperada = `sha256=${createHmac("sha256", appSecret).update(rawBody).digest("hex")}`, recebidaBuffer = Buffer.from(assinatura), esperadaBuffer = Buffer.from(esperada);
    if (recebidaBuffer.length !== esperadaBuffer.length || !timingSafeEqual(recebidaBuffer, esperadaBuffer)) throw new UnauthorizedException("Assinatura do webhook inválida.");
  }

  async processarWebhook(payload: any) {
    const status = (payload?.entry || []).flatMap((entry: any) => (entry?.changes || []).flatMap((change: any) => change?.value?.statuses || [])), mensagens = (payload?.entry || []).flatMap((entry: any) => (entry?.changes || []).flatMap((change: any) => change?.value?.messages || []));
    for (const item of [...status, ...mensagens]) { const id = item.id || randomBytes(12).toString("hex"); try { await this.prisma.webhookWhatsapp.create({ data: { mensagemId: id + (item.timestamp ? "-" + item.timestamp : ""), telefone: telefoneLimpo(item.recipient_id || item.from), texto: item.status || null, payload: item as Prisma.InputJsonValue } }); } catch (error: any) { if (error?.code !== "P2002") throw error; } }
    return { recebidos: status.length + mensagens.length, observacao: "O webhook registra entrega e acesso. Valores da proposta são aceitos somente pelo formulário seguro." };
  }

  private async gravarResposta(participacao: any, dto: RespostaPublicaCotacaoDto, enviar: boolean, ip?: string) {
    const itemIds = new Set(participacao.cotacao.itens.map((item: any) => item.id));
    if (dto.itens.some(item => !itemIds.has(item.cotacaoItemId))) throw new BadRequestException("A resposta contém um produto que não pertence a esta cotação.");
    if (enviar && dto.itens.length !== itemIds.size) throw new BadRequestException("Preencha a disponibilidade de todos os produtos.");
    if (enviar && !dto.responsavelNome?.trim()) throw new BadRequestException("Informe o nome do responsável pela proposta.");
    for (const item of dto.itens) if (enviar && item.disponivel && (!item.precoUnitario || item.precoUnitario <= 0)) throw new BadRequestException("Informe o preço unitário de todos os produtos disponíveis.");
    const eraResposta = [ParticipacaoCotacaoStatus.RESPONDIDO, ParticipacaoCotacaoStatus.RESPOSTA_ALTERADA].includes(participacao.status);
    await this.prisma.$transaction(async tx => {
      for (const resposta of dto.itens) {
        const solicitado = participacao.cotacao.itens.find((item: any) => item.id === resposta.cotacaoItemId)!, existente = participacao.itens.find((item: any) => item.cotacaoItemId === resposta.cotacaoItemId);
        const data = { disponivel: resposta.disponivel, precoUnitario: resposta.disponivel ? resposta.precoUnitario ?? null : null, marcaOferecida: limpo(resposta.marcaOferecida), embalagem: limpo(resposta.embalagem), quantidadeEmbalagem: resposta.quantidadeEmbalagem, quantidadeMinima: resposta.quantidadeMinima, prazoDias: resposta.prazoDias, dataPrevistaEntrega: dataOuNull(resposta.dataPrevistaEntrega), observacoes: limpo(resposta.observacoes), valorTotal: resposta.disponivel && resposta.precoUnitario != null ? resposta.precoUnitario * n(solicitado.quantidadeSolicitada) : null };
        if (existente) await tx.cotacaoItemProposta.update({ where: { id: existente.id }, data }); else await tx.cotacaoItemProposta.create({ data: { participacaoId: participacao.id, cotacaoItemId: resposta.cotacaoItemId, ...data } });
      }
      const primeiro = dto.itens.find(item => item.disponivel && item.precoUnitario != null);
      await tx.cotacaoFornecedor.update({ where: { id: participacao.id }, data: { status: enviar ? (eraResposta ? ParticipacaoCotacaoStatus.RESPOSTA_ALTERADA : ParticipacaoCotacaoStatus.RESPONDIDO) : ParticipacaoCotacaoStatus.RASCUNHO_SALVO, precoUnitario: primeiro?.precoUnitario, frete: dto.frete ?? 0, desconto: dto.desconto ?? 0, condicoes: limpo(dto.condicaoPagamento), formaPagamento: limpo(dto.formaPagamento), prazoPagamento: dto.prazoPagamento, validadeProposta: dataOuNull(dto.validadeProposta), responsavelNome: limpo(dto.responsavelNome), responsavelTelefone: limpo(dto.responsavelTelefone), observacoesGerais: limpo(dto.observacoesGerais), anexos: dto.anexos ? JSON.parse(JSON.stringify(dto.anexos)) : undefined, origemResposta: "FORMULARIO", iniciadaEm: participacao.iniciadaEm || new Date(), rascunhoEm: new Date(), ...(enviar ? { respondidaEm: new Date(), bloqueada: true, ipResposta: limpo(ip) } : {}) } });
      if (enviar) await tx.cotacao.update({ where: { id: participacao.cotacaoId }, data: { status: CotacaoStatus.RESPONDIDA } });
      await tx.compraAuditoria.create({ data: { entidade: "COTACAO_FORNECEDOR", entidadeId: participacao.id, acao: enviar ? "RESPOSTA_ENVIADA" : "RASCUNHO_SALVO", detalhes: { itens: dto.itens.length, ip } } });
    });
  }

  private async carregarPublica(token: string) {
    const p = await this.prisma.cotacaoFornecedor.findUnique({ where: { tokenPublico: token }, include: { fornecedor: true, itens: true, cotacao: { include: { itens: { include: { insumo: true } } } } } });
    if (!p) throw new NotFoundException("Link de cotação inválido."); return p;
  }

  private validarToken(p: any, editar = false) {
    if (p.tokenCanceladoEm) throw new BadRequestException("Este link foi cancelado pelo comprador.");
    if (p.tokenValidoAte && new Date(p.tokenValidoAte) < new Date()) throw new BadRequestException("O prazo desta cotação foi encerrado.");
    if (encerrada(p.cotacao.status)) throw new BadRequestException("Esta cotação já foi encerrada.");
    if (editar && p.bloqueada) throw new BadRequestException("Esta proposta já foi enviada e está bloqueada para alterações.");
    if (p.status === ParticipacaoCotacaoStatus.RECUSADO) throw new BadRequestException("A participação nesta cotação foi recusada.");
  }

  private apresentarPublica(p: any) {
    const respostas = new Map(p.itens.map((item: any) => [item.cotacaoItemId, item]));
    return { empresa: { nome: process.env.COMPANY_NAME || "Império das Parmegianas", logoUrl: process.env.COMPANY_LOGO_URL || null }, cotacao: { codigo: p.cotacao.codigo, criadoEm: p.cotacao.criadoEm, prazoResposta: p.cotacao.prazoResposta, observacoes: p.cotacao.observacoes, status: p.cotacao.status.toLowerCase() }, fornecedor: { nome: p.fornecedor.nome }, participacao: { status: p.status.toLowerCase(), bloqueada: p.bloqueada, versao: p.versao, frete: n(p.frete), desconto: n(p.desconto), condicaoPagamento: p.condicoes, formaPagamento: p.formaPagamento, prazoPagamento: p.prazoPagamento, validadeProposta: p.validadeProposta, responsavelNome: p.responsavelNome, responsavelTelefone: p.responsavelTelefone, observacoesGerais: p.observacoesGerais, anexos: p.anexos || [] }, itens: p.cotacao.itens.map((item: any) => { const r: any = respostas.get(item.id); return { id: item.id, codigo: item.insumo.codigo, nome: item.insumo.nome, quantidade: n(item.quantidadeSolicitada), unidade: item.unidade, marcaPreferencial: item.marcaPreferencial, embalagemSolicitada: item.embalagemSolicitada, observacoes: item.observacoes, dataDesejadaEntrega: item.dataDesejadaEntrega, resposta: r ? { disponivel: r.disponivel, precoUnitario: r.precoUnitario == null ? "" : n(r.precoUnitario), marcaOferecida: r.marcaOferecida || "", embalagem: r.embalagem || "", quantidadeEmbalagem: r.quantidadeEmbalagem == null ? "" : n(r.quantidadeEmbalagem), quantidadeMinima: r.quantidadeMinima == null ? "" : n(r.quantidadeMinima), prazoDias: r.prazoDias ?? "", dataPrevistaEntrega: r.dataPrevistaEntrega, observacoes: r.observacoes || "" } : null }; }) };
  }

  private incluirCotacao(): any { return { itens: { include: { insumo: true, propostas: { include: { participacao: { include: { fornecedor: true } } } } } }, propostas: { include: { fornecedor: true, itens: { include: { cotacaoItem: { include: { insumo: true } } } }, acessos: { orderBy: { criadoEm: "desc" }, take: 1 } } }, pedidos: { include: { fornecedor: true, itens: { include: { insumo: true } }, recebimentos: true } } }; }

  private apresentar(cotacao: any) {
    const itens = cotacao.itens?.length ? cotacao.itens.map((item: any) => ({ id: item.id, insumoId: item.insumoId, codigo: item.insumo.codigo, nome: item.insumo.nome, categoria: item.insumo.categoria, quantidade: n(item.quantidadeSolicitada), unidade: item.unidade, marcaPreferencial: item.marcaPreferencial, embalagemSolicitada: item.embalagemSolicitada, observacoes: item.observacoes, dataDesejadaEntrega: item.dataDesejadaEntrega, ultimoPreco: n(item.ultimoPreco), propostas: (item.propostas || []).map((p: any) => ({ id: p.id, participacaoId: p.participacaoId, fornecedorId: p.participacao.fornecedorId, fornecedor: p.participacao.fornecedor.nome, disponivel: p.disponivel, precoUnitario: p.precoUnitario == null ? null : n(p.precoUnitario), marca: p.marcaOferecida, embalagem: p.embalagem, prazoDias: p.prazoDias, dataEntrega: p.dataPrevistaEntrega, valorTotal: p.valorTotal == null ? null : n(p.valorTotal), selecionada: p.selecionada })) })) : [{ id: "legado-" + cotacao.id, codigo: cotacao.insumoCodigo, nome: cotacao.descricao, quantidade: n(cotacao.quantidade), unidade: cotacao.unidade, propostas: [] }];
    const propostas = cotacao.propostas.map((p: any) => { const subtotal = p.itens?.length ? p.itens.reduce((total: number, item: any) => total + (item.valorTotal == null ? 0 : n(item.valorTotal)), 0) : p.precoUnitario == null ? 0 : n(p.precoUnitario) * n(cotacao.quantidade), respondeu = [ParticipacaoCotacaoStatus.RESPONDIDO, ParticipacaoCotacaoStatus.RESPOSTA_ALTERADA].includes(p.status) || p.respondidaEm; return { id: p.id, fornecedorId: p.fornecedorId, fornecedor: p.fornecedor.nome, telefone: p.fornecedor.whatsapp || p.fornecedor.telefone, status: p.status.toLowerCase(), linkResposta: p.tokenPublico ? this.linkPublico(p.tokenPublico) : null, enviadaEm: p.enviadaEm, acessadaEm: p.acessadaEm, rascunhoEm: p.rascunhoEm, respondidaEm: p.respondidaEm, recusadaEm: p.recusadaEm, motivoRecusa: p.motivoRecusa, precoUnitario: p.precoUnitario == null ? null : n(p.precoUnitario), prazoDias: p.prazoDias, condicoes: p.condicoes, impostoIncluso: p.impostoIncluso, origemResposta: p.origemResposta, frete: n(p.frete), desconto: n(p.desconto), condicaoPagamento: p.condicoes, formaPagamento: p.formaPagamento, prazoPagamento: p.prazoPagamento, validadeProposta: p.validadeProposta, responsavelNome: p.responsavelNome, selecionada: p.selecionada, respondeu: Boolean(respondeu), total: respondeu ? Math.max(0, subtotal + n(p.frete) - n(p.desconto)) : null }; });
    const respondidas = propostas.filter((item: any) => item.total != null).sort((a: any, b: any) => a.total - b.total), maior = respondidas.reduce((max: number, item: any) => Math.max(max, item.total), 0);
    return { id: cotacao.id, codigo: cotacao.codigo, item: cotacao.descricao, quantidade: n(cotacao.quantidade), unidade: cotacao.unidade, insumoCodigo: cotacao.insumoCodigo, estoqueAtual: cotacao.estoqueAtual == null ? null : n(cotacao.estoqueAtual), estoqueMinimo: cotacao.estoqueMinimo == null ? null : n(cotacao.estoqueMinimo), status: cotacao.status.toLowerCase(), prazoResposta: cotacao.prazoResposta, observacoes: cotacao.observacoes, economiaTotal: cotacao.economiaTotal == null ? (respondidas[0] ? maior - respondidas[0].total : 0) : n(cotacao.economiaTotal), itens, propostas, melhor: respondidas[0] || null, pedidos: (cotacao.pedidos || []).map((item: any) => this.apresentarPedido(item)), criadoEm: cotacao.criadoEm, atualizadoEm: cotacao.atualizadoEm };
  }

  private apresentarPedido(pedido: any) { return { id: pedido.id, codigo: pedido.codigo, cotacaoCodigo: pedido.cotacao?.codigo || null, fornecedor: pedido.fornecedor?.nome, fornecedorId: pedido.fornecedorId, status: pedido.status.toLowerCase(), valorTotal: n(pedido.valorTotal), frete: n(pedido.frete), desconto: n(pedido.desconto), condicaoPagamento: pedido.condicaoPagamento, formaPagamento: pedido.formaPagamento, dataPrevistaEntrega: pedido.dataPrevistaEntrega, responsavelCompra: pedido.responsavelCompra, observacoes: pedido.observacoes, pdfDisponivel: Boolean(pedido.pdfArquivo || pedido.pdfGeradoEm), itens: (pedido.itens || []).map((item: any) => ({ id: item.id, insumoId: item.insumoId, codigo: item.insumo?.codigo, nome: item.insumo?.nome, quantidade: n(item.quantidade), unidade: item.unidade || item.insumo?.unidade, custoUnitario: n(item.custoUnitario), marca: item.marca, embalagem: item.embalagem })), recebimentos: pedido.recebimentos || [], criadoEm: pedido.criadoEm, atualizadoEm: pedido.atualizadoEm }; }

  private mensagemWhatsapp(cotacao: any, fornecedor: string, link: string) { const itens = cotacao.itens.map((item: any, indice: number) => `${indice + 1}. ${item.insumo.nome} - ${n(item.quantidadeSolicitada).toLocaleString("pt-BR")} ${item.unidade}`).join("\n"); return `Olá, ${fornecedor}.\n\nA ${process.env.COMPANY_NAME || "Império das Parmegianas"} está realizando a cotação nº ${cotacao.codigo}.\n\nProdutos solicitados:\n${itens}\n\nClique no link para informar preços, marcas, prazos e condições de pagamento:\n${link}\n\nPrazo para resposta: ${this.dataHora(cotacao.prazoResposta)}.\n\nAgradecemos pela participação.`; }
  private linkPublico(token: string) { return (process.env.PUBLIC_APP_URL || process.env.WEB_ORIGIN || "http://localhost:5173").split(",")[0].replace(/\/$/, "") + "/cotacao/" + token; }
  private numeroWhatsapp(valor?: string | null) { const x = telefoneLimpo(valor); return x.length >= 12 ? x : x.length >= 10 ? "55" + x : ""; }
  private dataHora(valor?: Date | null) { return valor ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(valor)) : "a combinar"; }
  private async proximoCodigo(prefixo: string, tx: any = this.prisma, sufixo = 0) { for (let tentativa = 0; tentativa < 8; tentativa += 1) { const codigo = prefixo + "-" + new Date().getFullYear() + "-" + (Date.now().toString(36) + (sufixo || "") + (tentativa || "")).toUpperCase(); const existe = prefixo === "COT" ? await tx.cotacao.findUnique({ where: { codigo }, select: { id: true } }) : await tx.pedidoCompra.findUnique({ where: { codigo }, select: { id: true } }); if (!existe) return codigo; } return prefixo + "-" + randomBytes(6).toString("hex").toUpperCase(); }

  private gerarPdfPedido(pedido: any) {
    const ascii = (texto: unknown) => String(texto ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "-"), dinheiro = (valor: unknown) => "R$ " + n(valor).toFixed(2).replace(".", ",");
    const linhas = ["IMPERIO DAS PARMEGIANAS", "PEDIDO DE COMPRA " + pedido.codigo, "Cotacao: " + (pedido.cotacao?.codigo || "-"), "Fornecedor: " + pedido.fornecedor.nome, "CNPJ: " + (pedido.fornecedor.cnpj || "-"), "Emissao: " + new Date().toLocaleDateString("pt-BR"), "", "PRODUTOS", ...pedido.itens.flatMap((item: any) => [item.insumo.nome + " | " + n(item.quantidade) + " " + (item.unidade || item.insumo.unidade), "  Unitario: " + dinheiro(item.custoUnitario) + " | Total: " + dinheiro(n(item.quantidade) * n(item.custoUnitario))]), "", "Frete: " + dinheiro(pedido.frete), "Desconto: " + dinheiro(pedido.desconto), "TOTAL: " + dinheiro(pedido.valorTotal), "Pagamento: " + (pedido.condicaoPagamento || pedido.formaPagamento || "A combinar"), "Previsao de entrega: " + (pedido.dataPrevistaEntrega ? new Date(pedido.dataPrevistaEntrega).toLocaleDateString("pt-BR") : "A combinar"), "", "Responsavel: " + (pedido.responsavelCompra || "-"), "Assinatura/confirmacao: ______________________________"];
    const esc = (x: unknown) => ascii(x).replace(/[()\\]/g, "\\$&"), comandos = ["BT", "/F1 16 Tf", "50 800 Td", "(" + esc(linhas[0]) + ") Tj", "/F1 10 Tf"]; linhas.slice(1, 42).forEach(linha => comandos.push("0 -18 Td", "(" + esc(linha) + ") Tj")); comandos.push("ET");
    const stream = comandos.join("\n"), objetos = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>", "<< /Length " + Buffer.byteLength(stream) + " >>\nstream\n" + stream + "\nendstream", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"];
    let pdf = "%PDF-1.4\n"; const offsets = [0]; objetos.forEach((objeto, indice) => { offsets.push(Buffer.byteLength(pdf)); pdf += (indice + 1) + " 0 obj\n" + objeto + "\nendobj\n"; }); const xref = Buffer.byteLength(pdf); pdf += "xref\n0 " + (objetos.length + 1) + "\n0000000000 65535 f \n" + offsets.slice(1).map(offset => String(offset).padStart(10, "0") + " 00000 n ").join("\n") + "\ntrailer << /Size " + (objetos.length + 1) + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF"; return Buffer.from(pdf, "ascii");
  }
}
