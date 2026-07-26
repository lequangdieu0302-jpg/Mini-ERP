import { NextRequest, NextResponse } from 'next/server';

// POST /api/count-objects
// Body: { templateImage: string (base64 dataURL), fullImage: string (base64 dataURL) }
export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  try {
    const { templateImage, fullImage } = await req.json();

    if (!templateImage || !fullImage) {
      return NextResponse.json({ error: 'Missing templateImage or fullImage' }, { status: 400 });
    }

    // Extract base64 data from dataURL (e.g. "data:image/jpeg;base64,/9j/...")
    const extractBase64 = (dataUrl: string): { data: string; mimeType: string } => {
      const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) throw new Error('Invalid image dataURL format');
      return { mimeType: match[1], data: match[2] };
    };

    const sample = extractBase64(templateImage);
    const full = extractBase64(fullImage);

    const prompt = `Nhiem vu cua ban la xac dinh va dem so luong san pham trong anh toan canh dua tren anh mau.

Input:
- Image 1 (dau tien): anh mau cua mot san pham.
- Image 2 (thu hai): anh toan canh chua nhieu san pham.

Quy trinh:
1. Phan tich Image 1 (anh mau): xac dinh chinh xac object can tim, ghi nho hinh dang, mau sac, hoa van, logo, kich thuoc tuong doi, huong dat, dac diem noi bat.
2. Phan tich Image 2 (anh toan canh): quet toan bo anh tu trai sang phai, tren xuong duoi. Chi danh dau nhung object giong Image 1. Chap nhan: xoay, nghieng, thay doi kich thuoc, che khuat duoi 30%.
3. Voi moi object tim duoc: kiem tra lai bang cach so sanh voi Image 1. Neu do giong thap thi bo qua. Khong duoc dem hai lan cung mot object.
4. Toa do x, y, width, height la PHAN TRAM (0-100) so voi chieu rong va chieu cao cua anh toan canh. Bo qua neu confidence < 0.7.

QUAN TRONG: Chi tra ve JSON thuan tuy, khong markdown, khong giai thich.
Format bat buoc: {"count":15,"objects":[{"x":10,"y":20,"width":15,"height":12,"confidence":0.93}]}`;

    const requestBody = {
      contents: [
        {
          parts: [
            { inline_data: { mime_type: sample.mimeType, data: sample.data } },
            { inline_data: { mime_type: full.mimeType, data: full.data } },
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json'
      }
    };

    // Try multiple models in order - fall through on 429 quota errors
    const MODELS = [
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
    ];

    let lastError = '';
    for (const model of MODELS) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (response.status === 429) {
        const errBody = await response.json().catch(() => ({}));
        lastError = `${model}: hết quota (429)`;
        console.warn(`[count-objects] ${lastError}. Trying next model...`);
        continue; // try next model
      }

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Gemini API error (${model}):`, errText);
        return NextResponse.json({ error: `Gemini API error ${response.status} on ${model}: ${errText.slice(0, 200)}` }, { status: 502 });
      }

      const geminiData = await response.json();
      const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      let parsed: { count: number; objects: Array<{ x: number; y: number; width: number; height: number; confidence: number }> };
      try {
        const cleaned = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch {
        console.error('Failed to parse Gemini JSON response:', rawText);
        return NextResponse.json({ error: 'Failed to parse AI response', raw: rawText }, { status: 500 });
      }

      console.log(`[count-objects] Success with model: ${model}, count: ${parsed.count}`);
      return NextResponse.json(parsed);
    }

    // All models exhausted
    return NextResponse.json({
      error: `Tất cả model đều hết quota free tier. Chi tiết: ${lastError}. Vui lòng kiểm tra billing tại https://ai.dev/rate-limit`
    }, { status: 429 });

  } catch (err) {
    console.error('count-objects error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

