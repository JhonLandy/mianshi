import './App.css';
import {useState, useMemo } from "react"
import { length } from "ramda"
import { dp, getPrint, getCombinations, calc } from "./utils"
import Drawer from "./components/Drawer";


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
    }), [circles, printer])
    const onStart = () => {
        if (!isRun) {
            setState({ ...state, isRun: true, cases: 0 })
            dpTer.run()
        } else {
            setState({ ...initialState,  circles, cases: 0 })
            dpTer.stop()
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
