import math
def svg(name, d):
    open(name,"w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><title>Sniptape</title><path fill="#000" fill-rule="evenodd" d="{d}"/></svg>')
f=lambda x,y: f"{x:.2f} {y:.2f}"
h=16; A=26; x0,x1=86,170; per=x1-x0
def yc(x): return 128-A*math.sin(2*math.pi*(x-x0)/per)
def dy(x): return -A*2*math.pi/per*math.cos(2*math.pi*(x-x0)/per)
N=48; up=[];dn=[]
for i in range(N+1):
    x=x0+per*i/N; y=yc(x); s=dy(x); n=math.hypot(1,s); nx,ny=-s/n,1/n
    up.append((x-nx*h,y-ny*h)); dn.append((x+nx*h,y+ny*h))
wave="M"+" L".join(f(*p) for p in up)+" L"+" L".join(f(*p) for p in reversed(dn))+" Z"
def stub(xa,xb,round_left):
    if round_left: return f"M{f(xa+h,112)} H{xb} V144 H{xa+h} A{h} {h} 0 0 1 {f(xa+h,112)} Z"
    return f"M{xa} 112 H{xb-h} A{h} {h} 0 0 1 {f(xb-h,144)} H{xa} Z"
svg("e-symbol.svg", f"{stub(16,70,True)} {wave} {stub(186,240,False)}")
def pill(x,y,w,hh): r=hh/2; return f"M{x+r} {y} H{x+w-r} A{r} {r} 0 0 1 {x+w-r} {y+hh} H{x+r} A{r} {r} 0 0 1 {x+r} {y} Z"
def rrect(x,y,w,hh,r): return f"M{x+r} {y} H{x+w-r} A{r} {r} 0 0 1 {x+w} {y+r} V{y+hh-r} A{r} {r} 0 0 1 {x+w-r} {y+hh} H{x+r} A{r} {r} 0 0 1 {x} {y+hh-r} V{y+r} A{r} {r} 0 0 1 {x+r} {y} Z"
svg("f-symbol.svg", f"{pill(16,104,56,48)} {rrect(84,76,88,104,32)} {pill(184,104,56,48)}")
