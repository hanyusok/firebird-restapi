import iconv from 'iconv-lite';

// Helper function to convert UTC date to local time
export const convertToLocalTime = (dateStr: string | Date | null): string | null => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
};

// Helper function to encode Korean characters
export const encodeKorean = (text: string | null): Buffer | null => {
    if (!text) return null;
    const encodedBuffer = iconv.encode(text, 'euc-kr');
    return encodedBuffer;
};

// Helper function to decode Korean characters
export const decodeKorean = (buffer: Buffer | string | null): string | null => {
    if (!buffer) return null;
    // If the buffer is already a string, return it
    if (typeof buffer === 'string') {
        return buffer;
    }
    const decodedText = iconv.decode(buffer, 'euc-kr');
    return decodedText;
};

// Helper function to process Korean fields in PERSON table result
export const processKoreanFields = (result: any): any => {
    if (Array.isArray(result)) {
        const processed = result.map(item => {
            return {
                ...item,
                PNAME: decodeKorean(item.PNAME),
                RELATION2: decodeKorean(item.RELATION2),
                MEMO1: decodeKorean(item.MEMO1),
                MEMO2: decodeKorean(item.MEMO2),
                PBIRTH: convertToLocalTime(item.PBIRTH),
                VINFORM: convertToLocalTime(item.VINFORM),
                LASTCHECK: convertToLocalTime(item.LASTCHECK),
                CARDCHECK: convertToLocalTime(item.CARDCHECK)
            };
        });
        return processed;
    }

    const processed = {
        ...result,
        PNAME: decodeKorean(result.PNAME),
        RELATION2: decodeKorean(result.RELATION2),
        MEMO1: decodeKorean(result.MEMO1),
        MEMO2: decodeKorean(result.MEMO2),
        PBIRTH: convertToLocalTime(result.PBIRTH),
        VINFORM: convertToLocalTime(result.VINFORM),
        LASTCHECK: convertToLocalTime(result.LASTCHECK),
        CARDCHECK: convertToLocalTime(result.CARDCHECK)
    };
    return processed;
};

// Helper function to process Korean fields in MTSWAIT table result
export const processMtswaitFields = (result: any): any => {
    if (Array.isArray(result)) {
        const processed = result.map(item => {
            return {
                ...item,
                DISPLAYNAME: decodeKorean(item.DISPLAYNAME),
                VISIDATE: convertToLocalTime(item.VISIDATE)
            };
        });
        return processed;
    }

    const processed = {
        ...result,
        DISPLAYNAME: decodeKorean(result.DISPLAYNAME),
        VISIDATE: convertToLocalTime(result.VISIDATE)
    };
    return processed;
};

export const generateResIds = (visidate: string | Date) => {
    const date = new Date(visidate);
    const year = date.getFullYear();

    let y, m, d;
    // Check if visidate is a string like YYYY-MM-DD
    if (typeof visidate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(visidate)) {
        [y, m, d] = visidate.split('-');
    } else {
        y = String(year);
        m = String(date.getMonth() + 1).padStart(2, '0');
        d = String(date.getDate()).padStart(2, '0');
    }

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // Generate RESID1: YYYYMMDDHHMMSS
    const resid1 = `${y}${m}${d}${hours}${minutes}${seconds}`;

    // Generate RESID2: YYYY-MM-DD
    const resid2 = `${y}-${m}-${d}`;

    return { resid1, resid2 };
};