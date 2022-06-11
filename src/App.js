import './App.css';
import {useState, memo, Fragment } from "react"
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
function dp(node) {
    const result = []
    const len = node.length
    const mark = {} // 回溯标记
    function find(index = 0, temp = []) {
        if (temp.length === len) {
            result.push([...temp])
            return
        }
        for (let i = 0; i < len;i++) {
            if (!mark[i]) {
                mark[i] = true
                temp.push(i)
                find(index + 1, temp)
                temp.pop()
                mark[i] = null
            }
        }
    }
    find()
    return result
}
let GLOBAL_MIN_DIS = Number.MAX_VALUE
let GLOBAL_RUN = false
function print(paths, callback, isRun) {
    const _paths = [...paths]
    const path = _paths.shift()
    if (!path) {
        return
    }
    requestAnimationFrame(() => {
        if (!GLOBAL_RUN) {
            return
        }
        callback(path)
        print(_paths, callback, isRun)
    })
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
            const paths = dp(circles)
            print(paths, (path) => {
                const [lines, dis] = calc(circles, path)
                if (dis < GLOBAL_MIN_DIS) {
                    setMaxCircles(circles)
                    setMaxLines(lines)
                    setMinDistance(dis)
                    GLOBAL_MIN_DIS = dis
                }
                setCombinations(paths.length)
                setLines(lines)
                setDistance(dis)
            }, isRun)
            setRun(true)
            GLOBAL_RUN = true
        } else {
            setRun(false)
            GLOBAL_RUN = false
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
