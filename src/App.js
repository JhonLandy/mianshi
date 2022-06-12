import './App.css';
import {useState, memo, Fragment } from "react"
import { length } from "ramda"

let GLOBAL_MIN_DIS = Number.MAX_VALUE
let GLOBAL_RUN = false
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
function dp1(node) {
    function find(index, results = []) {
        const len = results.length
        const res = []
        if (len === 0) {
            res.push([index])
            return res
        }
        for (let i = 0;i < len;i++) {
            const result = results[i]
            const len = result.length
            for (let j = 0;j <= len;j++) {
                const font = result.slice(0, j)
                const end = result.slice(j)
                font.push(index)
                res.push(font.concat(end))
            }
        }
        return res
    }
    const len = node.length
    let findResult = []
    for (let i = 0;i < len;i++) {
        findResult = find(i, findResult)
    }
    return findResult
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
    const path = []

    const nLen = length(node)
    const sum = getCombinations(nLen)
    let isPause = false
    let isReStart = false
    let result = []
    let num = 0
    function find(pIndex = 0) {
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
                } else {
                    if (length(result) >= 100) {
                        isPause = true
                        isReStart = true
                        callback(result)
                        result = []
                        requestIdleCallback(() => {
                            console.log("----------------------开始增量-------------------")
                            find()
                        })
                    }
                }
                return
            }
        }
        for (let i = start; i < nLen;i++) {
            if (!GLOBAL_RUN || isPause) break;
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
    find()
    return sum
}

function getPrint(callback) {
    const paths = []
    let isPaint = false
    function print() {
        const path = paths.shift()
        if (!path) {
            return
        }
        requestAnimationFrame(() => {
            if (!GLOBAL_RUN) {
                return
            }
            callback(path)
            print(paths, callback)
        })
    }

    return {
        print: () => {
            if (!isPaint) {
                isPaint = true
                print(paths, callback)
                isPaint = false
            }
        },
        push: newPaths => {
            paths.push(newPaths)
        }
    }
}
const MinBlock = memo((props) => {
    const { data } = props
    return (
        <Fragment>
            {data.map(([x, y], index) => {
                const color = `rgb(
                                ${Math.floor(Math.random() * 256)}, 
                                ${Math.floor(Math.random() * 256)}, 
                                ${Math.floor(Math.random() * 256)}
                            )`
                return (
                    <circle key={index} cx={x} cy={y}  fill={color} r="5"/>
                )
            })}
        </Fragment>
    )
})
const Block = memo((props) => {
    const { data } = props
    return (
        <Fragment>
            {data.map(([x, y], index) => {
                const color = `rgb(
                                ${Math.floor(Math.random() * 256)}, 
                                ${Math.floor(Math.random() * 256)}, 
                                ${Math.floor(Math.random() * 256)}
                            )`
                return (
                    <circle key={index} cx={x} cy={y}  fill={color} r="5"/>
                )
            })}
        </Fragment>
    )
})
function App() {

    const [circles, setCircles] = useState([])
    const [lines, setLines] = useState([])
    const [maxCircles, setMaxCircles] = useState([])
    const [distance, setDistance] = useState(0)
    const [minDistance, setMinDistance] = useState(0)
    const [maxLines, setMaxLines] = useState([])
    const [isRun, setRun] = useState(false)
    const [combinations, setCombinations] = useState(1)

    const onStart = () => {
        if (!isRun) {
            GLOBAL_RUN = true
            setRun(GLOBAL_RUN)
            const printer = getPrint((path) => {
                const [lines, dis] = calc(circles, path)
                if (dis < GLOBAL_MIN_DIS) {
                    setMaxCircles(circles)
                    setMaxLines(lines)
                    setMinDistance(dis)
                    GLOBAL_MIN_DIS = dis
                }
                setLines(lines)
                setDistance(dis)
            })
            const sum = dp(circles, function (paths) {
                printer.push(...paths)
                printer.print()
            })
            setCombinations(sum)
        } else {
            GLOBAL_RUN = false
            setRun(GLOBAL_RUN)
        }
    }
    const onDraw = (e) => {
        const x = e.clientX
        const y = e.clientY
        const { left } = e.target.getBoundingClientRect()
        setCircles([...circles, [x - left, y - 59.5]])
    }

    return (
        <div className="App" style={{ margin: "0 auto", width: "450px"}}>
            <div style={{ textAlign: "left", height: "25px" }}>
                <p>Combinations: {combinations ?? 1}</p>
            </div>
            <div style={{display: "flex", justifyContent: "space-between"}}>
                <section>
                    <div style={{ textAlign: "left" }}>length: {distance}</div>
                    <svg
                        width="200"
                        height="200"
                        x="1"
                        y="10"
                        style={{ border: "1px solid #ccc"}}
                        onClick={onDraw}
                    >
                        {
                            lines.map(([x1, y1, x2, y2], index) => {

                                return (
                                    <line
                                        key={index}
                                        x1={x1}
                                        y1={y1}
                                        x2={x2}
                                        y2={y2}
                                        strokeWidth="5"
                                        stroke="palegreen"
                                    >
                                    </line>
                                )
                            })
                        }
                        <Block data={circles}/>
                    </svg>
                </section>
                <section>
                    <div style={{ textAlign: "left" }}>length: {minDistance}</div>
                    <svg width="200" height="200" style={{ border: "1px solid #ccc"}}>
                        {
                            maxLines.map(([x1, y1, x2, y2], index) => {

                                return (
                                    <line
                                        key={index}
                                        x1={x1}
                                        y1={y1}
                                        x2={x2}
                                        y2={y2}
                                        strokeWidth="5"
                                        stroke="palegreen"
                                    >
                                    </line>
                                )
                            })
                        }
                        <MinBlock data={maxCircles}/>
                    </svg>
                </section>
            </div>
            <button style={{ width: "100%" }} onClick={onStart}>{isRun ? "stop" : "start"}</button>
            <div>
                <p>p{`pointer(${circles.length})`}</p>
                <div style={{ textAlign: "left", border: "1px solid #ccc"}}>{
                    circles.map(([x, y], index) => {
                        return <div key={index} style={{ borderTop: "1px solid #ccc"}}>{`x:${x} y:${y}`}</div>
                    })
                }</div>
            </div>
        </div>
    );
}

export default App;
