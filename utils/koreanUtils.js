const iconv = require('iconv-lite');

// Helper function to encode Korean characters
const encodeKorean = (text) => {
    if (!text) return null;   
    const encodedBuffer = iconv.encode(text, 'euc-kr');
    return encodedBuffer;
};

// Helper function to decode Korean characters
const decodeKorean = (buffer) => {
    if (!buffer) return null;
    // If the buffer is already a string, return it
    if (typeof buffer === 'string') {
        return buffer;
    }    
    const decodedText = iconv.decode(buffer, 'euc-kr');    
    return decodedText;
};

// Helper function to process Korean fields in result
const processKoreanFields = (result) => {   
    if (Array.isArray(result)) {
        const processed = result.map(item => {            
            return {
                ...item,
                PNAME: decodeKorean(item.PNAME),
                RELATION2: decodeKorean(item.RELATION2),
                MEMO1: decodeKorean(item.MEMO1),
                MEMO2: decodeKorean(item.MEMO2)
            };
        });        
        return processed;
    }
    
    const processed = {
        ...result,
        PNAME: decodeKorean(result.PNAME),
        RELATION2: decodeKorean(result.RELATION2),
        MEMO1: decodeKorean(result.MEMO1),
        MEMO2: decodeKorean(result.MEMO2)
    };    
    return processed;
};

module.exports = {
    encodeKorean,
    decodeKorean,
    processKoreanFields
}; 