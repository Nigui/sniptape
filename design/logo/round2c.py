import math
def svg(name, d):
    open(name,"w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><title>Sniptape</title><path fill="#000" fill-rule="evenodd" d="{d}"/></svg>')
Rc,h,cy=40,18,128
def P(c,r,a): a=math.radians(a); return (c[0]+r*math.cos(a), c[1]+r*math.sin(a))
fm=lambda p: f"{p[0]:.2f} {p[1]:.2f}"
def piece(segs, cap_start, cap_end):
    L=[(c,(Rc+h if cw else Rc-h),a0,a1,cw) for c,a0,a1,cw in segs]
    R=[(c,(Rc-h if cw else Rc+h),a0,a1,cw) for c,a0,a1,cw in segs]
    d=f"M{fm(P(L[0][0],L[0][1],L[0][2]))}"
    for c,r,a0,a1,cw in L: d+=f" A{r} {r} 0 {1 if abs(a1-a0)>180 else 0} {cw} {fm(P(c,r,a1))}"
    c,r,a0,a1,cw=R[-1]; e=P(c,r,a1)
    d+= f" A{h} {h} 0 0 1 {fm(e)}" if cap_end else f" L{fm(e)}"
    for c,r,a0,a1,cw in reversed(R): d+=f" A{r} {r} 0 {1 if abs(a1-a0)>180 else 0} {1-cw} {fm(P(c,r,a0))}"
    s=P(L[0][0],L[0][1],L[0][2])
    d+= f" A{h} {h} 0 0 1 {fm(s)}" if cap_start else f" L{fm(s)}"
    return d+" Z"
c1,c2=(88,cy),(168,cy); g=14
p1=piece([(c1,180,270-g,1)],True,False)
p2=piece([(c1,270+g,360,1),(c2,180,90+g,0)],False,False)
p3=piece([(c2,90-g,0,0)],False,True)
svg("e-symbol.svg",f"{p1} {p2} {p3}")
def pill(x,y,w,hh): r=hh/2; return f"M{x+r} {y} H{x+w-r} A{r} {r} 0 0 1 {x+w-r} {y+hh} H{x+r} A{r} {r} 0 0 1 {x+r} {y} Z"
def vpill(cx,cy_,w,hh): r=w/2; x=cx-r; y1=cy_-hh/2+r; y2=cy_+hh/2-r; return f"M{x} {y1} A{r} {r} 0 0 1 {x+w} {y1} V{y2} A{r} {r} 0 0 1 {x} {y2} Z"
def rrect(x,y,w,hh,r): return f"M{x+r} {y} H{x+w-r} A{r} {r} 0 0 1 {x+w} {y+r} V{y+hh-r} A{r} {r} 0 0 1 {x+w-r} {y+hh} H{x+r} A{r} {r} 0 0 1 {x} {y+hh-r} V{y+r} A{r} {r} 0 0 1 {x+r} {y} Z"
slots=" ".join(vpill(x,128,14,hh) for x,hh in [(106,32),(128,60),(150,40)])
svg("f-symbol.svg", f"{pill(16,104,56,48)} {rrect(84,76,88,104,32)} {slots} {pill(184,104,56,48)}")
