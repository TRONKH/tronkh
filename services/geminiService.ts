
import { GoogleGenAI, Modality, Part } from "@google/genai";

// Hàm tiện ích để chuyển đổi File thành đối tượng Part cho Gemini API
export const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      }
    };
    reader.readAsDataURL(file);
  });
  
  const base64Data = await base64EncodedDataPromise;
  
  return {
    inlineData: {
      data: base64Data,
      mimeType: file.type,
    },
  };
};

export const generateModelImage = async (productImagePart: Part, style: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY មិនត្រូវបានកំណត់នៅក្នុងអថេរបរិស្ថានទេ។");
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const basePrompt = `បង្កើតរូបភាពជាក់ស្តែងដែលមានគុណភាពខ្ពស់ដូចរូបថតអាជីព។ នៅក្នុងរូបថត តារាម៉ូដែល (អាចជាបុរស ឬស្ត្រី អាស្រ័យលើផលិតផល) កំពុងឈរថតយ៉ាងមានភាពទាក់ទាញជាមួយផលិតផលដែលបានផ្តល់ឱ្យ។`;
    const finalInstructions = `ផលិតផលត្រូវតែជាការផ្តោតសំខាន់។ កុំបន្ថែមអត្ថបទឬឡូហ្គោណាមួយទៅក្នុងរូបភាព។`;

    const stylePrompts: { [key: string]: string } = {
        studio: `ផ្ទៃខាងក្រោយគួរតែស្អាត តូចបំផុត ឬសមរម្យសម្រាប់រចនាប័ទ្មផលិតផល (ឧទាហរណ៍ ស្ទូឌីយោ)។ ពន្លឺត្រូវតែមានជំនាញវិជ្ជាជីវៈ។`,
        outdoor: `ផ្ទៃខាងក្រោយគឺជាទីតាំងខាងក្រៅដ៏ស្រស់ស្អាត ដូចជាឧទ្យានដែលមានពន្លឺថ្ងៃ ផ្លូវក្នុងទីក្រុងបែបទំនើប ឬទិដ្ឋភាពធម្មជាតិដ៏ស្រស់ត្រកាល។ ពន្លឺគួរតែជាពន្លឺធម្មជាតិនិងមើលទៅមានលក្ខណៈវិជ្ជាជីវៈ។`,
        lobby: `ផ្ទៃខាងក្រោយគឺជាឡប់ប៊ីសណ្ឋាគារដ៏ប្រណិតនិងទំនើប ឬច្រកចូលអគារលំដាប់ខ្ពស់ ដែលមានស្ថាបត្យកម្មទំនើប គ្រឿងសង្ហារឹមទាន់សម័យ និងពន្លឺល្អឥតខ្ចោះ។`
    };

    const selectedStylePrompt = stylePrompts[style] || stylePrompts['studio'];

    const fullPrompt = `${basePrompt} ${selectedStylePrompt} ${finalInstructions}`;

    const textPart: Part = {
        text: fullPrompt,
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [productImagePart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        
        throw new Error("គ្មានរូបភាពណាមួយត្រូវបានបង្កើតចេញពី API ទេ។");

    } catch (error) {
        console.error("កំហុសនៅពេលហៅ Gemini API៖", error);
        throw new Error("មិនអាចបង្កើតរូបភាពបានទេ។ សូម​ព្យាយាម​ម្តង​ទៀត។");
    }
};
