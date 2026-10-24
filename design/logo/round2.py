import math
def svg(name, d, extra=""):
    open(name,"w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><title>Sniptape</title><path fill="#000" fill-rule="evenodd" d="{d}"/>{extra}</svg>')
def pill(cx, cy, w, h):
    r=w/2; x=cx-r; y1=cy-h/2+r; y2=cy+h/2-r
    return f"M{x} {y1} A{r} {r} 0 0 1 {x+w} {y1} V{y2} A{r} {r} 0 0 1 {x} {y2} Z"

# D trimmed wave: offcut bars, wide gap, kept bars
bars=[(32,28),(60,48),(104,96),(128,152),(152,112),(196,56),(224,28)]
svg("d-symbol.svg"," ".join(pill(x,128,20,h) for x,h in bars))

# E wave ribbon from half-rings, butt cuts at two peaks, round outer ends
Rc,h=28,15; cy=128
centers=[44,100,156,212]  # half rings alternate: up (CW), down (CCW)
def P(c,r,a): a=math.radians(a); return (c[0]+r*math.cos(a), c[1]+r*math.sin(a))
def f(p): return f"{p[0]:.2f} {p[1]:.2f}"
segs_all=[((44,cy),180,360,1),((100,cy),180,0,0),((156,cy),180,360,1),((212,cy),180,0,0)]
def piece(segs, cap_start, cap_end):
    # segs: (center, a0, a1, cw)
    left=[]; right=[]
    for c,a0,a1,cw in segs:
        rl = Rc+h if cw else Rc-h
        rr = Rc-h if cw else Rc+h
        left.append((c,rl,a0,a1,cw)); right.append((c,rr,a0,a1,cw))
    c,r,a0,a1,cw=left[0]; d=f"M{f(P(c,r,a0))}"
    for c,r,a0,a1,cw in left:
        large=1 if abs(a1-a0)>180 else 0
        d+=f" A{r} {r} 0 {large} {cw} {f(P(c,r,a1))}"
    c,r,a0,a1,cw=right[-1]; end=P(c,r,a1)
    d+= f" A{h} {h} 0 0 1 {f(end)}" if cap_end else f" L{f(end)}"
    for c,r,a0,a1,cw in reversed(right):
        large=1 if abs(a1-a0)>180 else 0
        d+=f" A{r} {r} 0 {large} {1-cw} {f(P(c,r,a0))}"
    c,r,a0,a1,cw=left[0]; st=P(c,r,a0)
    d+= f" A{h} {h} 0 0 1 {f(st)}" if cap_start else f" L{f(st)}"
    return d+" Z"
g=15  # half-gap angle in degrees at the peaks
p1=piece([((44,cy),180,270-g,1)],True,False)
p2=piece([((44,cy),270+g,360,1),((100,cy),180,0,0),((156,cy),180,360,1),((212,cy),180,90+g,0)],False,False)
p3=piece([((212,cy),90-g,0,0)],False,True)
svg("e-symbol.svg",f"{p1} {p2} {p3}")

# F snipped tape: stadium cut by two S-curved gaps, kept piece with negative-space bars
top,bot=92,164; r=(bot-top)/2; gap=7
def cut(x, sign):  # S-curve from top to bottom around x
    return (x+sign*gap, x-12, x+12)
def left_piece():
    x=72; a=x-gap
    return (f"M{16+r} {top} H{a+10} C{a-4} {top+20} {a+4} {bot-20} {a-10} {bot} H{16+r} A{r} {r} 0 0 1 {16+r} {top} Z")
def mid_piece():
    x1=72+gap; x2=184+gap
    return (f"M{x1+10} {top} H{x2-14} C{x2-28} {top+20} {x2-20} {bot-20} {x2-34} {bot} H{x1-10} C{x1+4} {bot-20} {x1-4} {top+20} {x1+10} {top} Z")
def right_piece():
    x=184+gap; b=x+gap
    return (f"M{b-14+gap} {top} H{240-r} A{r} {r} 0 0 1 {240-r} {bot} H{b-34+gap} C{b-20+gap} {bot-20} {b-28+gap} {top+20} {b-14+gap} {top} Z")
slots=" ".join(pill(x,128,12,h) for x,h in [(108,24),(126,44),(144,32)])
svg("f-symbol.svg",f"{left_piece()} {mid_piece()} {slots} {right_piece()}")
