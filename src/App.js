import './App.css';
import {useState, memo, Fragment, useMemo, useCallback} from "react"
import { length } from "ramda"
import Drawer from "./components/Drawer";
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
    let isStop = true
    let result = []
    let num = 0
    function find(pIndex = 0) {
        if (isStop) {
            isPause = false
            isReStart = false
            num = 0
            result = []
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
            if (isPause || isStop) break;
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
            isStop = false
            find()
        },
        stop: function () {
            isStop = true
            isPause = false
            isReStart = false
        }
    }
}

function getPrint(callback) {
    let paths = []
    let isPaint = false

    function print(paths, callback) {
        const path = paths.shift()
        if (!path) {
            isPaint = false
            return
        }
        requestAnimationFrame(() => {
            if (!isPaint) {
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
            }
        },
        push: newPaths => {
            paths.push(...newPaths)
        },
        stopPrint: () => {
            isPaint = false
            paths = []
        }
    }
}
const splitTask = window.requestIdleCallback ?  requestIdleCallback : window.setTimeout
function App() {
    const initialState = {
        circles: [],
        lines: [],
        maxCircles: [],
        maxLines: [],
        distance: 0,
        minDistance: Number.MAX_VALUE,
        isRun:false,
        cases: 0
    }
    const [state, setState] = useState(initialState)
    const {
        circles,
        lines,
        maxCircles,
        maxLines,
        distance,
        minDistance,
        cases,
        isRun
    } = state

    const combinations = useMemo(() => getCombinations(length(circles)), [circles])
    const printer = useMemo(() => getPrint((path) => {
        const [lines, distance] = calc(circles, path)
        setState(state => {
            const { minDistance } = state
            const newState = {
                ...state,
                lines,
                distance,
                cases: state.cases + 1
            }
            if (distance < minDistance) {
                Object.assign(newState, {
                    maxLines: lines,
                    minDistance: distance,
                    maxCircles: state.circles,
                })
            }
            return newState
        })
    }), [circles])
    const dpTer = useMemo(() => dp(circles, function (paths) {
        printer.push(paths)
        printer.print()
    }), [circles])
    const onStart = () => {
        if (!isRun) {
            setState({ ...state, isRun: true })
            dpTer.run()
        } else {
            setState({ ...state, isRun: false })
            dpTer.stop()
            printer.stopPrint()
        }
    }
    const onDraw = (e) => {
        const x = e.clientX
        const y = e.clientY
        const { left } = e.target.getBoundingClientRect()
        setState({ ...state, circles: [ ...circles, [x - left, y - 59.5]] })
    }
    return (
        <div className="App" style={{ margin: "0 auto", width: "450px"}}>
            <div style={{ textAlign: "left", height: "25px" }}>
                <p>Combinations: {combinations ?? 1}</p>
            </div>
            <div style={{display: "flex", justifyContent: "space-between"}}>
               <Drawer
                   circles={circles}
                   lines={lines}
                   onDraw={onDraw}
                   distance={distance}
                   cases={cases}
               />
               <Drawer
                   circles={maxCircles}
                   lines={maxLines}
                   distance={minDistance}
               />
            </div>
            <button style={{ width: "100%" }} onClick={onStart}>{isRun ? "stop" : "start"}</button>
            <div>
                <p>p{`pointer(${circles?.length})`}</p>
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
