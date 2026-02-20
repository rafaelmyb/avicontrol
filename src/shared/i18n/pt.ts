/**
 * Portuguese (Brazil) UI strings.
 * Keys in English; values shown to the user.
 */
export const pt = {
  // Auth
  login: "Entrar",
  register: "Cadastrar",
  email: "E-mail",
  password: "Senha",
  confirmPassword: "Confirmar senha",
  logout: "Sair",
  invalidCredentials: "E-mail ou senha inválidos.",
  emailRequired: "E-mail é obrigatório.",
  passwordRequired: "Senha é obrigatória.",
  passwordsDoNotMatch: "As senhas não coincidem.",
  registerSuccess: "Conta criada. Faça login.",

  // App
  appName: "AviControl",
  dashboard: "Painel",
  chickens: "Galinhas",
  brood: "Ninhada",
  feed: "Ração",
  finance: "Financeiro",

  // Chicken
  addChicken: "Adicionar galinha",
  chickenName: "Nome",
  breed: "Raça",
  birthDate: "Data de nascimento",
  status: "Status",
  age: "Idade",
  ageDays: (days: number) => `${days} dias`,
  layStartDate: "Início da postura (previsto)",
  noChickens: "Nenhuma galinha cadastrada.",
  totalChickens: "Total de galinhas",
  layingChickens: "Em postura",
  broodingChickens: "Chocando",
  chick: "Pintinho",
  pullet: "Franga",
  laying: "Em postura",
  brooding: "Chocando",
  recovering: "Recuperação",
  retired: "Aposentada",
  sold: "Vendida",
  deceased: "Óbito",
  save: "Salvar",
  cancel: "Cancelar",
  delete: "Excluir",
  edit: "Editar",

  // Brood
  addBroodCycle: "Adicionar ciclo de ninhada",
  broodCycle: "Ciclo de ninhada",
  startDate: "Data de início",
  eggCount: "Quantidade de ovos",
  expectedHatchDate: "Previsão de eclosão",
  expectedReturnToLayDate: "Previsão retorno à postura",
  actualHatchedCount: "Eclodidos",
  upcomingBroodEvents: "Próximos eventos de ninhada",

  // Feed
  feedInventory: "Estoque de ração",
  addFeed: "Adicionar ração",
  feedName: "Nome",
  feedType: "Tipo",
  weightKg: "Peso (kg)",
  price: "Preço",
  consumptionPerBirdGrams: "Consumo por ave (g/dia)",
  purchaseDate: "Data da compra",
  estimatedRestockDate: "Previsão de reabastecimento",
  feedRestockAlert: "Alerta de ração",
  lowFeedWarning: "Ração acabando em breve",

  // Finance
  expenses: "Despesas",
  revenue: "Receita",
  addExpense: "Adicionar despesa",
  addRevenue: "Adicionar receita",
  amount: "Valor",
  description: "Descrição",
  category: "Categoria",
  source: "Origem",
  date: "Data",
  monthlyProfit: "Lucro mensal",
  annualProjection: "Projeção anual",
  profit: "Lucro",
  loss: "Prejuízo",

  // Dashboard
  estimatedMonthlyEggs: "Ovos estimados (mês)",
  noData: "Sem dados",

  // Common
  loading: "Carregando...",
  error: "Erro",
  retry: "Tentar novamente",
} as const;

export type PtKeys = keyof typeof pt;
