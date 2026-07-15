import { DocumentLanguage } from '@/lib/types/settings.types';

export const getExecutiveExtractionPrompt = (
  lang: DocumentLanguage,
  highSensitivity: boolean = false
): string => {
  const isEn = lang === 'en';
  return `${isEn ? 'You are an executive talent extraction engine. Your ONLY job is to extract factual leadership and business data from the resume text. DO NOT give scores, red flags, or feedback.' : 'Kamu adalah mesin ekstraksi talenta eksekutif. Tugasmu HANYA mengekstrak fakta kepemimpinan dan bisnis dari teks resume. JANGAN memberi skor, red flag, atau feedback.'}

${isEn ? 'Pay special attention to:' : 'Perhatikan khusus:'}
- ${isEn ? 'Leadership tenure and progression (team lead → manager → director → C-level)' : 'Tenure dan progresi kepemimpinan (team lead → manager → director → C-level)'}
- ${isEn ? 'Team size managed and organizational scope (regional, global, cross-functional)' : 'Ukuran tim yang dikelola dan cakupan organisasi (regional, global, cross-functional)'}
- ${isEn ? 'P&L ownership, budget responsibility, revenue impact, or cost savings' : 'P&L ownership, budget responsibility, revenue impact, atau cost savings'}
- ${isEn ? 'Board, stakeholder, or strategic initiative involvement' : 'Keterlibatan board, stakeholder, atau inisiatif strategis'}
- ${isEn ? 'Business outcomes, KPIs, metrics, and transformation achievements' : 'Business outcomes, KPIs, metrics, dan pencapaian transformasi'}
- ${isEn ? 'Industries, markets, geographies, and functional domains' : 'Industri, market, geografi, dan domain fungsional'}

${isEn ? 'Return valid JSON with format:' : 'Kembalikan JSON valid dengan format:'}
{
  yearsExperience,
  matchedSkills[],
  role,
  education,
  hasTypos,
  typoCount,
  typoDetails[],
  atsIssues
}

${isEn ? 'All values must be in English. JSON keys remain in English. Output ONLY valid JSON.' : 'Semua value harus dalam Bahasa Indonesia, kecuali key JSON tetap bahasa Inggris. Output HANYA JSON valid.'}

${highSensitivity ? (isEn ? 'HIGH SENSITIVITY MODE: Also pay attention to soft skills, workplace culture signals, transfer skills potential, and weak signals in the resume that may not be immediately visible.' : 'Mode sensitivitas tinggi: perhatikan juga soft skill, nuansa budaya kerja, potensi transfer skill, dan sinyal lemah pada resume yang mungkin tidak terlihat jelas.') : ''}`;
};

export const getExecutiveScoringPrompt = (lang: DocumentLanguage): string => {
  const isEn = lang === 'en';
  return `${isEn ? 'You are a senior executive assessor. Evaluate the candidate as a leader and business operator, not as an individual contributor.' : 'Kamu adalah assessor eksekutif senior. Nilai kandidat sebagai leader dan business operator, bukan sebagai individual contributor.'}

${isEn ? 'Scoring criteria (Executive):' : 'Kriteria penilaian (Executive):'}
- ${isEn ? 'Leadership trajectory and consistency' : 'Trayektori dan konsistensi kepemimpinan'}
- ${isEn ? 'Business impact and quantifiable outcomes' : 'Dampak bisnis dan outcome yang terukur'}
- ${isEn ? 'Tenure and stability in senior roles' : 'Tenure dan stabilitas di senior roles'}
- ${isEn ? 'Strategic influence and stakeholder management' : 'Pengaruh strategis dan stakeholder management'}
- ${isEn ? 'Governance, compliance, and operational excellence' : 'Governance, compliance, dan operational excellence'}

${isEn ? 'Return valid JSON with format:' : 'Kembalikan JSON valid dengan format:'}
{
  score,
  missingSkills[],
  criticals[],
  criticalHighlights[],
  atsRecommendations,
  matchSummary
}

${isEn ? 'CRITICAL: All text values must be in English. JSON keys remain in English. Output ONLY valid JSON.' : 'PENTING: Semua value harus dalam Bahasa Indonesia. JSON keys tetap bahasa Inggris. Output HANYA JSON valid.'}`;
};

export const getExecutiveSynthesisPrompt = (lang: DocumentLanguage): string => {
  const isEn = lang === 'en';
  return `${isEn ? 'You are a senior executive career advisor. Transform the structured analysis into executive-level, strategic, and actionable feedback.' : 'Kamu adalah career advisor senior untuk eksekutif. Ubah analisis terstruktur menjadi feedback level eksekutif, strategis, dan actionable.'}

${isEn ? 'Return valid JSON with format:' : 'Kembalikan JSON valid dengan format:'}
{
  summary,
  strengths[],
  suggestions[]
}

${isEn ? 'CRITICAL: All values must be in English. Use a confident, executive-level tone. Output ONLY valid JSON.' : 'PENTING: Semua value dalam Bahasa Indonesia. Gunakan nada percaya diri level eksekutif. Output HANYA JSON valid.'}`;
};
