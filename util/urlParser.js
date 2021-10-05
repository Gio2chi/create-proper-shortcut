getMode = (url) => {
    try {
        return parseUrl(url).mode
    } catch (error) {
        return error
    }
}

getPrefix = (url) => {
    try {
        return parseUrl(url).prefix
    } catch (error) {
        return error
    }
}

getDomain = (url) => {
    try {
        return parseUrl(url).domainName
    } catch (error) {
        return error
    }
}

getSuffix = (url) => {
    try {
        return parseUrl(url).suffix
    } catch (error) {
        return error
    }
}

getPath = (url) => {
    try {
        return parseUrl(url).path
    } catch (error) {
        return error
    }
}

parseUrl = (url) => {
    var urlParsed = {
        mode: "https",
        prefix: "www",
        domainName: "",
        suffix: "",
        path: "/"
    }

    if(!url) return new Error("Invalid URL: ")
    if(url.includes("http")){
        if(!url.includes("https")) urlParsed.mode = "http"
        url = url.split(".")
        urlParsed.prefix = url[0].substring(url[0].indexOf("//") + 2, url[0].length)
        urlParsed.domainName = url[1]
        if(url.length != 3) for(var i = 3; i != url.length; i++) {
            url[2] += "." + url[i]
        }
        if(url[2].includes("/")){
            urlParsed.suffix = url[2].substring(0, url[2].indexOf("/"))
            urlParsed.path = url[2].substring(url[2].indexOf("/"), url[2].length)
        }else urlParsed.suffix = url[2]
    } else {
        var hasPath = false
        if(url.includes("/")) hasPath = true
        if(hasPath){
            url = url.split("/", 2)
            urlParsed.domainName = url[1]
            url = url[0].split(".")
        } else url = url.split(".")
        if(url.length == 2){
            urlParsed.domainName = url[0]
            urlParsed.suffix = url[1]
        } else if(url.length == 3) {
            urlParsed.prefix = url[0]
            urlParsed.domainName = url[1]
            urlParsed.suffix = url[2]
        } else return new Error("Invalid URL")
    }

    return urlParsed
}

module.exports = {
    getMode, 
    getPrefix, 
    getDomain,
    getSuffix,
    getPath,
    parseUrl
}