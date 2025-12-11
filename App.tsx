import React, { useState, useCallback } from 'react';
import { TabType, ResultTabType, FormData, GeneratedArticle } from './types';
import { generateArticle } from './services/geminiService';
import { 
  Newspaper, 
  Flame, 
  Siren, 
  Loader2, 
  Copy, 
  CheckCheck, 
  Instagram, 
  Zap,
  Power,
  Image as ImageIcon,
  X,
  Upload
} from 'lucide-react';

const INITIAL_FORM_DATA: FormData = {
  date: new Date().toISOString().split('T')[0],
  time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  images: [],
  geralLocal: '',
  geralRelato: '',
  acidenteTipo: '',
  acidenteEnvolvidos: '',
  acidenteQtdVitimas: '',
  acidenteLesoes: '',
  acidenteAtendimento: 'Corpo de Bombeiros',
  acidenteDestino: '',
  acidenteLocal: '',
  acidenteRelato: '',
  crimeTipo: '',
  crimeBairro: '',
  crimeLocal: '',
  crimeDestino: '',
  crimePolicia: '',
  crimeDetalhes: ''
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('geral');
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedArticle | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<ResultTabType>('site');
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, reader.result as string]
          }));
        };
        reader.readAsDataURL(file as Blob);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleGenerate = async () => {
    if (!process.env.API_KEY) {
      alert("Erro: API Key não configurada no ambiente.");
      return;
    }

    // Basic Validation
    if (activeTab === 'geral' && (!formData.geralLocal || !formData.geralRelato)) {
      alert("Por favor, preencha o Local e o Relato.");
      return;
    }

    setLoading(true);
    setResult(null);
    setActiveResultTab('site'); // Reset to site tab on new generation
    try {
      const article = await generateArticle(activeTab, formData);
      setResult(article);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = useCallback(() => {
    if (!result) return;
    
    let textToCopy = "";
    if (activeResultTab === 'site') {
      textToCopy = `${result.title}\n\n${result.body}`;
    } else {
      textToCopy = result.instagramContent;
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result, activeResultTab]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F6F8]">
      
      {/* Header */}
      <header className="bg-white w-full py-3 shadow-sm z-10 sticky top-0 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          
          {/* Logo Catalão Online */}
          <div className="flex flex-col leading-none select-none">
            <span className="text-gray-500 font-light tracking-[0.2em] text-[10px] sm:text-xs uppercase mb-[-2px] sm:mb-[-4px] ml-1">
              CATALÃO
            </span>
            <div className="flex items-center text-brand-dark font-medium text-3xl sm:text-4xl">
              <div className="relative flex items-center justify-center mr-[1px]">
                {/* Power Icon representing the 'O' */}
                <Power className="text-brand-green w-6 h-6 sm:w-8 sm:h-8" strokeWidth={3} />
              </div>
              nline
            </div>
          </div>
          
          {/* NEW: Instagram Link */}
          <a 
            href="https://instagram.com/catalaonlineoficial" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-brand-green font-semibold hover:text-[#8bb335] transition-colors bg-green-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-green-100 hover:border-green-200"
          >
            <Instagram size={18} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline text-sm">@catalaonlineoficial</span>
          </a>
        </div>
      </header>

      <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-8 pb-20">
        
        {/* Tabs */}
        <div className="flex space-x-2 mb-0 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('geral')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-semibold transition-all flex-1 justify-center whitespace-nowrap
              ${activeTab === 'geral' 
                ? 'bg-white text-brand-green border-t-4 border-brand-green shadow-[0_-4px_10px_rgba(0,0,0,0.03)]' 
                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
          >
            <Newspaper size={18} />
            Geral / Padrão
          </button>
          <button
            onClick={() => setActiveTab('bombeiros')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-semibold transition-all flex-1 justify-center whitespace-nowrap
              ${activeTab === 'bombeiros' 
                ? 'bg-white text-brand-green border-t-4 border-brand-green shadow-[0_-4px_10px_rgba(0,0,0,0.03)]' 
                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
          >
            <Flame size={18} />
            Acidentes
          </button>
          <button
            onClick={() => setActiveTab('policia')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-semibold transition-all flex-1 justify-center whitespace-nowrap
              ${activeTab === 'policia' 
                ? 'bg-white text-brand-green border-t-4 border-brand-green shadow-[0_-4px_10px_rgba(0,0,0,0.03)]' 
                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
          >
            <Siren size={18} />
            Policial
          </button>
        </div>

        {/* Card */}
        <div className="bg-white p-6 md:p-8 rounded-b-xl rounded-tr-xl shadow-sm border border-gray-100">
          
          {/* Global Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Data da Ocorrência</label>
              <input 
                type="date" 
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Horário Aproximado</label>
              <input 
                type="time" 
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="mb-6">
             <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Imagens da Ocorrência</label>
             <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 transition-colors hover:border-brand-green bg-gray-50">
                <div className="flex flex-wrap gap-4 mb-2">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm group">
                      <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remover imagem"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <label className="w-24 h-24 flex flex-col items-center justify-center cursor-pointer bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-400 hover:text-brand-green">
                    <Upload size={24} />
                    <span className="text-[10px] mt-1 font-medium">Adicionar</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleImageUpload} 
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  <ImageIcon size={12} className="inline mr-1" />
                  As imagens ajudam a IA a descrever melhor a cena (veículos, cenário, etc).
                </p>
             </div>
          </div>

          {/* Form Content - Geral */}
          {activeTab === 'geral' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-4">
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Local / Endereço</label>
                <input 
                  type="text" 
                  name="geralLocal"
                  value={formData.geralLocal}
                  onChange={handleInputChange}
                  placeholder="Ex: Centro de Catalão" 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:bg-white transition-all"
                />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Relato do Fato</label>
                <textarea 
                  rows={6} 
                  name="geralRelato"
                  value={formData.geralRelato}
                  onChange={handleInputChange}
                  placeholder="Descreva o que aconteceu..." 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:bg-white transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* Form Content - Bombeiros */}
          {activeTab === 'bombeiros' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Tipo de Acidente</label>
                  <select 
                    name="acidenteTipo"
                    value={formData.acidenteTipo}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                  >
                    <option value="">Selecione...</option>
                    <option value="Colisão Carro x Moto">Colisão Carro x Moto</option>
                    <option value="Colisão Carro x Carro">Colisão Carro x Carro</option>
                    <option value="Atropelamento">Atropelamento</option>
                    <option value="Capotamento">Capotamento</option>
                    <option value="Queda de Moto">Queda de Moto</option>
                    <option value="Incêndio">Incêndio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Veículos/Objetos Envolvidos</label>
                  <input 
                    type="text" 
                    name="acidenteEnvolvidos"
                    value={formData.acidenteEnvolvidos}
                    onChange={handleInputChange}
                    placeholder="Ex: Honda Civic e CG 150" 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Quantas Vítimas?</label>
                  <input 
                    type="number"
                    name="acidenteQtdVitimas"
                    value={formData.acidenteQtdVitimas}
                    onChange={handleInputChange}
                    placeholder="0" 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Tipo de Lesões (Resumo)</label>
                  <input 
                    type="text" 
                    name="acidenteLesoes"
                    value={formData.acidenteLesoes}
                    onChange={handleInputChange}
                    placeholder="Ex: Escoriações leves..." 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Quem Atendeu?</label>
                  <select 
                    name="acidenteAtendimento"
                    value={formData.acidenteAtendimento}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                  >
                    <option value="Corpo de Bombeiros">Corpo de Bombeiros</option>
                    <option value="SAMU">SAMU</option>
                    <option value="Bombeiros e SAMU">Bombeiros e SAMU</option>
                    <option value="ECO-050">ECO-050</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Destino das Vítimas</label>
                  <select 
                    name="acidenteDestino"
                    value={formData.acidenteDestino}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                  >
                    <option value="">Selecione...</option>
                    <option value="Santa Casa">Santa Casa</option>
                    <option value="UPA">UPA</option>
                    <option value="Hospital Nasr Fayad">Hospital Nasr Fayad</option>
                    <option value="Hospital São Nicolau">Hospital São Nicolau</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Local Exato</label>
                <input 
                  type="text" 
                  name="acidenteLocal"
                  value={formData.acidenteLocal}
                  onChange={handleInputChange}
                  placeholder="Ex: Cruzamento da Av. 20 de Agosto" 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Relato do Fato</label>
                <textarea 
                  rows={4} 
                  name="acidenteRelato"
                  value={formData.acidenteRelato}
                  onChange={handleInputChange}
                  placeholder="Descreva detalhes de como ocorreu o acidente..." 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* Form Content - Policia */}
          {activeTab === 'policia' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Tipo de Crime / Ocorrência</label>
                  <input 
                    type="text" 
                    name="crimeTipo"
                    value={formData.crimeTipo}
                    onChange={handleInputChange}
                    placeholder="Ex: Furto em Comércio" 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-700 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Bairro</label>
                  <input 
                    type="text" 
                    name="crimeBairro"
                    value={formData.crimeBairro}
                    onChange={handleInputChange}
                    placeholder="Ex: Nossa Senhora de Fátima" 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-700 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Local Específico</label>
                <input 
                  type="text" 
                  name="crimeLocal"
                  value={formData.crimeLocal}
                  onChange={handleInputChange}
                  placeholder="Ex: Rua X, próximo ao mercado..." 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-700 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Para onde foi levado?</label>
                  <select 
                    name="crimeDestino"
                    value={formData.crimeDestino}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-700 focus:bg-white transition-all"
                  >
                    <option value="">Selecione...</option>
                    <option value="Central de Flagrantes">Central de Flagrantes</option>
                    <option value="DEAM">DEAM</option>
                    <option value="GEIC">GEIC</option>
                    <option value="Delegacia de Polícia de Ipameri">Delegacia de Polícia de Ipameri</option>
                    <option value="Delegacia de Polícia de Pires do Rio">Delegacia de Polícia de Pires do Rio</option>
                    <option value="Delegacia de Polícia de Goiandira">Delegacia de Polícia de Goiandira</option>
                    <option value="Delegacia de Polícia de Três Ranchos">Delegacia de Polícia de Três Ranchos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Quem atuou?</label>
                  <select 
                    name="crimePolicia"
                    value={formData.crimePolicia}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-700 focus:bg-white transition-all"
                  >
                    <option value="">Selecione...</option>
                    <option value="Polícia Militar (PM)">Polícia Militar (PM)</option>
                    <option value="Força Tática">Força Tática</option>
                    <option value="Polícia Militar (18ºBPM)">Polícia Militar (18ºBPM)</option>
                    <option value="Polícia Militar (11ºBPM)">Polícia Militar (11ºBPM)</option>
                    <option value="Polícia Militar (40ºCIPM)">Polícia Militar (40ºCIPM)</option>
                    <option value="CPE">CPE</option>
                    <option value="Polícia Civil">Polícia Civil</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Detalhes Adicionais</label>
                <textarea 
                  rows={3} 
                  name="crimeDetalhes"
                  value={formData.crimeDetalhes}
                  onChange={handleInputChange}
                  placeholder="Objetos apreendidos, iniciais dos envolvidos..." 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-700 focus:bg-white transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-brand-green to-[#8bb335] text-white p-4 rounded-full font-bold text-lg uppercase tracking-wide shadow-lg transform transition-all hover:-translate-y-1 hover:shadow-xl active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Processando...
              </>
            ) : (
              <>
                <Zap className="fill-current" /> Criar Matéria
              </>
            )}
          </button>
        </div>

        {/* Result Area */}
        {result && (
          <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Result Tabs */}
            <div className="flex border-b border-gray-100">
              <button 
                onClick={() => setActiveResultTab('site')}
                className={`flex-1 py-4 text-center font-bold flex justify-center items-center gap-2 transition-colors ${
                  activeResultTab === 'site' 
                    ? 'bg-white text-brand-green border-b-2 border-brand-green' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Newspaper size={18} />
                Matéria Site
              </button>
              <button 
                onClick={() => setActiveResultTab('instagram')}
                className={`flex-1 py-4 text-center font-bold flex justify-center items-center gap-2 transition-colors ${
                  activeResultTab === 'instagram' 
                    ? 'bg-white text-pink-600 border-b-2 border-pink-600' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Instagram size={18} />
                Instagram
              </button>
            </div>

            <div className="p-8">
              {activeResultTab === 'site' ? (
                <>
                  {formData.images.length > 0 && (
                    <div className="mb-6 rounded-lg overflow-hidden shadow-md">
                      <img 
                        src={formData.images[0]} 
                        alt="Imagem da ocorrência" 
                        className="w-full h-auto object-cover max-h-[400px]"
                      />
                    </div>
                  )}
                  <h3 className="text-2xl md:text-3xl font-extrabold text-brand-dark mb-6 leading-tight">
                    {result.title}
                  </h3>
                  <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {result.body}
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-4 text-pink-600 font-bold">
                    <Instagram size={20} />
                    <span>Legenda para Feed</span>
                  </div>
                  <textarea 
                    className="w-full bg-transparent border-none resize-none focus:ring-0 text-gray-700 whitespace-pre-wrap leading-relaxed h-auto"
                    readOnly
                    value={result.instagramContent}
                    rows={12}
                    style={{ minHeight: '300px' }}
                  />
                </div>
              )}
              
              <button 
                onClick={copyToClipboard}
                className={`mt-8 w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  copied 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {copied ? <CheckCheck size={18} /> : <Copy size={18} />}
                {copied ? 'Copiado!' : (activeResultTab === 'site' ? 'Copiar Matéria' : 'Copiar Legenda')}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}