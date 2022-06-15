import {length} from "ramda";

let GLOBAL_RUN = false

const splitTask = window.requestIdleCallback ?  requestIdleCallback : window.setTimeout

function start() {
    GLOBAL_RUN = true
}
function stop() {
    GLOBAL_RUN = false
}
function getDistance(start, end) {
    const [x1, y1] = start
    const [x2, y2] = end
    // 计算距离
    const l = Math.abs(x1 - x2)
    const k = Math.abs(y1 - y2)
    return Math.sqrt(l * l, k * k)
}
function calc(positions, path) {
    const _path = [...path]
    const len = positions.length
    let pre = _path.shift()
    let next = _path.shift()
    const result = []
    let distance = 0
    while (true) {
        const preP= positions[pre]
        const nextP = positions[next]
        distance += getDistance(preP, nextP)
        result.push([...preP, ...nextP])
        pre = next
        next = _path.shift()

        if (next === void 0) {// 到达最后一个
            const start = path[0]
            const end = path[len - 1]
            distance += getDistance(positions[start], positions[end])
            result.push([...positions[start], ...positions[end]])
            break
        }
    }
    return [result, distance]
}
function getCombinations(n) {
    let combinations = 1
    for(let i = 1;i <= n;i++) {
        combinations *= i
    }
    return combinations
}
function dp(node, callback) {
    const mark = {} // 回溯标记
    let path = []

    const nLen = length(node)
    const sum = getCombinations(nLen)
    let isPause = false
    let isReStart = false
    let result = []
    let num = 0
    function find(pIndex = 0) {
        if (!GLOBAL_RUN) {
            isPause = false
            isReStart = false
            result = []
            path = []
            num = 0
            return
        }
        const pLen = length(path)
        let start = 0
        if (isReStart) {
            isPause = false
            if (pIndex === pLen - 1) {
                start = path[pIndex] + 1
                path.pop()
                isReStart = false
            } else {
                start = path[pIndex]
            }
        } else {
            if (pLen === nLen) {
                result.push([...path])
                num++
                if (num === sum) {
                    callback(result)
                    result = []
                    path = []
                    num = 0
                } else {
                    if (length(result) >= 100) {
                        callback(result)
                        splitTask(() => {
                            find()
                        })
                        result = []
                        isPause = true
                        isReStart = true
                    }
                }
                return
            }
        }
        for (let i = start; i < nLen;i++) {
            if (isPause || !GLOBAL_RUN) {
                break;
            }
            if (!mark[i]) {
                mark[i] = true
                if (!isReStart) {
                    path.push(i)
                }
                find(pIndex + 1)
                mark[i] = null
                if (!isReStart) {
                    path.pop()
                };
            }
        }
    }
    return {
        run: function () {
            start()
            find()
        },
         stop: function () {
            stop()
         }
    }
}

function getPrint(callback) {
    let paths = []
    let isPaint = false

    function print(_paths, callback) {
        let path = _paths.shift()
        if (!path || !GLOBAL_RUN) {
            isPaint = false
            paths = []
            return
        }
        requestAnimationFrame(() => {
            if (isPaint) {
                callback(path)
                print(paths, callback)
            } else {
                paths = []
            }
        })
    }
    return {
        print: () => {
            if (!isPaint && GLOBAL_RUN) {
                isPaint = true
                print(paths, callback)
            }
        },
        push: newPaths => {
            if (GLOBAL_RUN) {
                paths.push(...newPaths)
            }
        }
    }
}
export { start, stop, getPrint, getCombinations, getDistance, dp, calc }
