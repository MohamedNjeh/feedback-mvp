// Multilingual negative-sentiment keywords for detecting customer complaints
// Includes: English, French, Modern Arabic, Tunisian Arabic, and Franco-Arab transliterations

export const NEGATIVE_KEYWORDS = [
  // English
  'bad', 'terrible', 'awful', 'horrible', 'poor', 'worst', 'disappointing', 'disappointed',
  'unacceptable', 'unprofessional', 'not professional', 'disrespectful', 'rude', 'slow',
  'cold', 'dirty', 'wrong', 'scam', 'rip-off', 'ripoff', 'overcharged', 'wrong bill',
  'messy', 'chaos', 'low quality', 'misleading', 'irresponsible', 'untrustworthy',
  'bad service', 'horrible service', 'terrible experience',
  
  // French
  'mauvais', 'nul', 'médiocre', 'décevant', 'déçu', 'très déçu', 'honteux', 'scandaleux',
  'arnaque', 'abusé', 'inacceptable', 'pas sérieux', 'pas professionnel', 'trop cher',
  'erreur de facture', 'tromperie', 'mensonge', 'manque de respect', 'mauvaise qualité',
  'mauvaise expérience', 'mauvais plan', 'service client 0', 'qualité 0',
  
  // Modern Arabic
  'سيء', 'فظيع', 'مخيب', 'غير مقبول', 'غير محترف', 'وقح', 'بطيء', 'بارد', 'قذر',
  'خطأ', 'احتيال', 'نصب', 'غالي', 'فاتورة خاطئة', 'فوضى', 'جودة منخفضة', 'مضلل',
  'غير مسؤول', 'لا يمكن الوثوق به', 'خدمة سيئة', 'تجربة فظيعة',
  
  // Tunisian Arabic
  'لا يحترم الحريف', 'غالط', 'مماطلة', 'حاجة غريبة', 'خايبة', 'مهزلة', 'حالة مكربة',
  'كذب', 'خيبة أمل', 'غشاشة', 'فاسد', 'غالي', 'فوضى', 'غلط في الفاتورة', 'خدمة صفر',
  'حسب الله ونعم الوكيل', 'تحيل', 'معدومة',
  
  // Tunisian Arabic (transliterated / Franco-Arab)
  '7aja grave', 'ghachecha', 'mekla 3al 7it', 'khayba', 'mahzla', '5ayba', 'kdheb',
  '5iba amel', 'ghali', 'fawdha', 'ghalat', '5edma sfer', 'ta7yil', 'ma3douma'
] as const

// Alert detection threshold
export const ALERT_RATING_THRESHOLD = 2
