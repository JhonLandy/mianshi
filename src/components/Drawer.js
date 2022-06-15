import {memo, useMemo} from "react";


const Drawer = memo((props) => {
    const {
        circles = [],
        lines = [],
        distance = 1,
        onDraw,
         cases
    } = props
    const _circles = useMemo(() =>
        circles.map(([x, y], index) => {
            const color = `rgb(
                ${Math.floor(Math.random() * 256)}, 
                ${Math.floor(Math.random() * 256)}, 
                ${Math.floor(Math.random() * 256)}
            )`
            return (
                <circle key={index} cx={x} cy={y} fill={color} r="5"/>
            )
    }), [circles])
    return (
        <section>
            <div style={{ textAlign: "left" }}>{ cases ? `case: ${cases}` :  ""}length: {circles.length > 0 ? distance: 0}</div>
            <svg width="200" height="200" style={{ border: "1px solid #ccc"}} onClick={onDraw}>
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
                {_circles}
            </svg>
        </section>
    )
})
export default Drawer
