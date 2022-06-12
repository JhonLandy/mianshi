onmessage = async function({data}) {
    // console.log('收到切片，开始计算hash', data)
    const arrayBuffer = await data.arrayBuffer()
    const hash = sparkMd5.ArrayBuffer.hash(arrayBuffer)
    postMessage(hash)
}
