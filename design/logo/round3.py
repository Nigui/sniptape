def svg(name, d):
    open(name,"w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><title>Sniptape</title><path fill="#000" fill-rule="evenodd" d="{d}"/></svg>')
def vpill(cx,w,h,cy=128):
    r=w/2; x=cx-r; y1=cy-h/2+r; y2=cy+h/2-r
    return f"M{x} {y1} A{r} {r} 0 0 1 {x+w} {y1} V{y2} A{r} {r} 0 0 1 {x} {y2} Z"
def dot(cx,d,cy=128):
    r=d/2; return f"M{cx-r} {cy} A{r} {r} 0 1 1 {cx+r} {cy} A{r} {r} 0 1 1 {cx-r} {cy} Z"
xs=[44,72,100,128,156,184,212]
svg("d1-symbol.svg"," ".join(vpill(x,20,h) for x,h in zip(xs,[28,52,104,160,124,60,28])))
svg("d2-symbol.svg"," ".join([dot(44,14),dot(72,20),vpill(100,20,104),vpill(128,20,160),vpill(156,20,124),dot(184,20),dot(212,14)]))
def stadium(x,y,w,h):
    r=w/2; return f"M{x} {y+r} A{r} {r} 0 0 1 {x+w} {y+r} V{y+h-r} A{r} {r} 0 0 1 {x} {y+h-r} Z"
cap=stadium(80,52,96,152)
slots=" ".join(vpill(x,14,h) for x,h in [(106,52),(128,96),(150,68)])
svg("d3-symbol.svg"," ".join([cap,slots,vpill(58,20,64),vpill(30,20,32),vpill(198,20,64),vpill(226,20,32)]))
