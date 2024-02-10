 function generatedEtag(content)  {
    if(!content) return null;
    const hash = require("crypto")
        .createHash("sha1")
        .update(JSON.stringify(content))
        .digest("hex");
    return `"${hash}"`;    

}

module.exports = { generatedEtag}