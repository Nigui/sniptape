import math
Rc,h,cy,half=40,16,128,8
c1,c2=(88,cy),(168,cy)
fm=lambda p: f"{p[0]:.2f} {p[1]:.2f}"
def P(c,r,a): a=math.radians(a); return (c[0]+r*math.cos(a), c[1]+r*math.sin(a))
def ang_top(c,r,dx): return 270+math.degrees(math.asin(dx/r))
def ang_bot(c,r,dx): return 90-math.degrees(math.asin(dx/r))
Ro,Ri=Rc+h,Rc-h
# piece 1: ring1 outer from 180 to top-left vertical cut, inner back
a_o=ang_top(c1,Ro,-half); a_i=ang_top(c1,Ri,-half)
p1=(f"M{fm(P(c1,Ro,180))} A{Ro} {Ro} 0 0 1 {fm(P(c1,Ro,a_o))} L{fm(P(c1,Ri,a_i))} "
    f"A{Ri} {Ri} 0 0 0 {fm(P(c1,Ri,180))} A{h} {h} 0 0 1 {fm(P(c1,Ro,180))} Z")
# piece 2: ring1 from top-right cut to 360, ring2 (bottom, CCW) from 180 to bottom-left cut
b_o=ang_top(c1,Ro,half); b_i=ang_top(c1,Ri,half)
q_o=ang_bot(c2,Ro,-half); q_i=ang_bot(c2,Ri,-half)
p2=(f"M{fm(P(c1,Ro,b_o))} A{Ro} {Ro} 0 0 1 {fm(P(c1,Ro,360))} A{Ri} {Ri} 0 0 0 {fm(P(c2,Ri,q_i))} "
    f"L{fm(P(c2,Ro,q_o))} A{Ro} {Ro} 0 0 1 {fm(P(c2,Ro,180))} A{Ri} {Ri} 0 0 0 {fm(P(c1,Ri,b_i))} Z")
# piece 3: ring2 from bottom-right cut to 0, round cap
r_o=ang_bot(c2,Ro,half); r_i=ang_bot(c2,Ri,half)
p3=(f"M{fm(P(c2,Ro,r_o))} A{Ro} {Ro} 0 0 0 {fm(P(c2,Ro,0))} A{h} {h} 0 0 0 {fm(P(c2,Ri,0))} "
    f"A{Ri} {Ri} 0 0 1 {fm(P(c2,Ri,r_i))} Z")
open("e-symbol.svg","w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><title>Sniptape</title><path fill="#000" d="{p1} {p2} {p3}"/></svg>')
