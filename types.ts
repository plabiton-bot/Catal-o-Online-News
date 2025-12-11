export type TabType = 'geral' | 'bombeiros' | 'policia';
export type ResultTabType = 'site' | 'instagram';

export interface FormData {
  // Global
  date: string;
  time: string;
  images: string[]; // Base64 strings of uploaded images

  // Geral
  geralLocal: string;
  geralRelato: string;

  // Bombeiros
  acidenteTipo: string;
  acidenteEnvolvidos: string;
  acidenteQtdVitimas: string;
  acidenteLesoes: string;
  acidenteAtendimento: string;
  acidenteDestino: string;
  acidenteLocal: string;
  acidenteRelato: string;

  // Policia
  crimeTipo: string;
  crimeBairro: string;
  crimeLocal: string;
  crimeDestino: string;
  crimePolicia: string;
  crimeDetalhes: string;
}

export interface GeneratedArticle {
  title: string;
  body: string;
  instagramContent: string;
}