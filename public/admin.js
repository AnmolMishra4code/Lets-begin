async function loadVisitors() {

    const res = await fetch("/api/visitors");

    const visitors = await res.json();

    document.getElementById("totalVisitors").textContent = visitors.length;

    let desktop = 0;
    let mobile = 0;

    const countries = new Set();

    let rows = "";

    visitors.reverse().forEach(v=>{

        if(v.device==="Desktop")
            desktop++;

        else
            mobile++;

        countries.add(v.country);

        rows+=`
        <tr>
            <td>${v.time}</td>
            <td>${v.browser}</td>
            <td>${v.os}</td>
            <td>${v.country}</td>
            <td>${v.device}</td>
        </tr>
        `;

    });

    document.getElementById("desktopUsers").textContent=desktop;
    document.getElementById("mobileUsers").textContent=mobile;
    document.getElementById("countries").textContent=countries.size;

    document.getElementById("visitorTable").innerHTML=rows;

}

loadVisitors();