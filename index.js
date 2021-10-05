const prompt = require('prompt-sync')({ sigint: true })
const ws = require('windows-shortcuts')
const https = require('https');
const fs = require('fs');
const converter = require('png-to-ico')
const path = require('path')
const {getDomain, getSuffix, getPath, getMode, getPrefix, parseUrl} = require('./util/urlParser.js')
const hide = require('./util/fileHider.js')


const site = prompt("For which site you are looking for a shortcut?")

createShortcut(site)


async function createShortcut(site){ 
    const iconPath = await getIconPath(site)
    if(iconPath.includes('http')){
        ws.create('C:\\Users\\gioan\\Desktop\\' + getDomain(site) + '.lnk', {
            target: getMode(site) + "://" + getPrefix(site) + "." + getDomain(site) + "." + getSuffix(site) + getPath(site),
            runStyle: ws.MIN,
            icon: iconPath
        }) 
    } else {
        await ws.create('C:\\Users\\gioan\\Desktop\\' + getDomain(site) + '.lnk', {
            target: getMode(site) + "://" + getPrefix(site) + "." + getDomain(site) + "." + getSuffix(site) + getPath(site),
            runStyle: ws.MIN,
            icon: "%UserProfile%/Desktop/" + getDomain(site) + ".lnk:" + "icon.ico"
        })
        console.log(getDomain(site) + ".ico", "%UserProfile%/Desktop/" + getDomain(site) + ".lnk")
        setTimeout(
            () => {
                hide(getDomain(site) + ".ico", "%UserProfile%/Desktop/" + getDomain(site) + ".lnk")
                fs.unlinkSync(getDomain(site) + ".ico")
            }, 
            200
        )
    }
    
}

async function getIconPath(site){
    if(await isValidFavicon(site)) return getUrl(site)
    else return downloadAndConvertToIcon(site)
}

async function getUrl(site){
    return new Promise((resolve) => {
        
        const req = https.request({host: "www." + getDomain(site) + "." + getSuffix(site), path: "/favicon.ico"}, (res) => {
            if(res.statusCode>=400) resolve(false)
            else {
                if(!res.headers.location) resolve(("https://www." + getDomain(site) + "." + getSuffix(site) + "/favicon.ico"))
                else{
                    var iconPath = (res.headers.location).split(",")[1]
                    iconPath = iconPath.substring(0, iconPath.indexOf(".ico") + 4)
                    resolve(iconPath)
                }
            }
        }).end()

        req.on('error', console.error)
    }).catch()
}

async function downloadAndConvertToIcon(site){
    const iconPath = await getIconPathFromHomePage(site)
    if(iconPath.search(".ico") != -1) return iconPath 
        
    return new Promise(resolve => {
        var file = fs.createWriteStream("./temp.png")
        https.get(iconPath, res => {
            res.pipe(file)
        }).on('close', () => {
            file.close()
            pngToIcon("./temp.png", getDomain(site) + ".ico")
            fs.unlinkSync("temp.png")
        })
            
        resolve(path.join(__dirname, getDomain(site) + ".ico"))
    }).catch()
}

function pngToIcon(pngPath, icoPath){
    converter([pngPath]).then(buffer => {
        fs.writeFileSync(icoPath, buffer)
    }).catch(console.error)
}

async function getIconPathFromHomePage(site){
    return new Promise((resolve) => {
        var content = ""
        https.request({host: "www." + getDomain(site) + "." + getSuffix(site), path: "/"}, (res) => {
            res.setEncoding("utf8")
            res.on("data", (data) => {
                content += data
            })

            res.on("end", () => {
                resolve(getIconPathFromContent(content))
            })
            res.on("error", (err) => {
                resolve(false)
            })
        }).end()
    }).catch()
}

function getIconPathFromContent(content){
    content = content.substr(0, content.lastIndexOf("<body>"))
    content = content.replace("\t", "")
    content = content.substr(content.search("apple-touch-icon"), 140)
    content = content.substring(content.search("href") + 6 , content.search("/>") - 1)
    return content
}

async function isValidFavicon(site) {
    return new Promise((resolve) => {
        const req = https.request({host: "www." + getDomain(site) + "." + getSuffix(site), path: "/favicon.ico"}, (res) => {
            if(res.statusCode>=400) resolve(false)
            else resolve(true)
        })
        req.on('error', (err) => {
            resolve(false)
        })
        req.end()
        
    }).catch()
}