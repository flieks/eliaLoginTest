import React from "react";


export default function CalendarsData(props) {
    const {data} = props

    return <div>
        <h5>Calendars: </h5>

        {data.value.map((calendar, inex) => {
            return <div>{calendar.name}</div>
        })}

    </div>
}