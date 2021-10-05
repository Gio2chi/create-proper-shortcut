const child = require('child_process')

hide = (secretFilePath, filePath) => {
    //console.log(`type "${secretFilePath}" > "${filePath}":"${secretFilePath}"`)
    child.execSync(`type "${secretFilePath}" > "${filePath}":icon.ico`, (err, result, stderr)=>{
        console.log(err + "\n", result + "\n", stderr)
    })
}

module.exports = hide