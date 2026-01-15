const cursor=document.createElement("div");
cursor.className="cursor";
document.body.appendChild(cursor);

let x=0, y=0;
window.addEventListener("mousemove", e=>{
  x=e.clientX;
  y=e.clientY;
  cursor.style.transform=`translate(${x}px,${y}px)`;
});

if(window.innerWidth<768) cursor.style.display="none";
