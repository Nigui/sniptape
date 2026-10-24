import math, json
def rgb(L,C,h):
    a=C*math.cos(math.radians(h)); b=C*math.sin(math.radians(h))
    l_=L+0.3963377774*a+0.2158037573*b; m_=L-0.1055613458*a-0.0638541728*b; s_=L-0.0894841775*a-1.2914855480*b
    l,m,s=l_**3,m_**3,s_**3
    return [min(max(x,0),1) for x in (4.0767416621*l-3.3077115913*m+0.2309699292*s,-1.2684380046*l+2.6097574011*m-0.3413193965*s,-0.0041960863*l-0.7034186147*m+1.7076147010*s)]
def hexc(c):
    enc=lambda x: 12.92*x if x<=0.0031308 else 1.055*x**(1/2.4)-0.055
    return "#"+"".join(f"{round(enc(x)*255):02X}" for x in rgb(*c))
def lum(c): return sum(k*v for k,v in zip((0.2126,0.7152,0.0722),rgb(*c)))
def cr(a,b): A,B=lum(a),lum(b); return round((max(A,B)+.05)/(min(A,B)+.05),2)
P={
 "pine":     dict(h=165, primary=(0.52,0.10,165), on=(1,0,0),            ui=(0.52,0.10,165), logo=(0.52,0.10,165), dprimary=(0.74,0.11,165), don=(0.18,0.03,165), dui=(0.74,0.11,165)),
 "berry":    dict(h=355, primary=(0.53,0.17,355), on=(1,0,0),            ui=(0.53,0.17,355), logo=(0.58,0.19,355), dprimary=(0.74,0.14,355), don=(0.18,0.03,355), dui=(0.74,0.14,355)),
 "ultramarine": dict(h=262, primary=(0.47,0.19,262), on=(1,0,0), ui=(0.47,0.19,262), logo=(0.50,0.20,262), dprimary=(0.74,0.12,258), don=(0.18,0.03,262), dui=(0.74,0.12,258)),
 "petrol":   dict(h=225, primary=(0.48,0.09,225), on=(1,0,0),            ui=(0.48,0.09,225), logo=(0.50,0.10,225), dprimary=(0.74,0.10,220), don=(0.18,0.03,225), dui=(0.74,0.10,220)),
}
out={}
for n,p in P.items():
    h=p["h"]; card=(1,0,0); ground=(0.968,0.006,h); dcard=(0.225,0.009,h); dground=(0.17,0.008,h); ink=(0.22,0.015,h)
    row=dict(
      button_text=cr(p["primary"],p["on"]), ui_on_card=cr(p["ui"],card), logo_on_white=cr(p["logo"],card), logo_on_dark=cr(p["logo"],dground),
      d_button_text=cr(p["dprimary"],p["don"]), d_ui_on_card=cr(p["dui"],dcard))
    print(f"{n:9}", row)
    out[n]={k:(hexc(v) if isinstance(v,tuple) else v) for k,v in p.items()}
    out[n].update(oklch={k:v for k,v in p.items() if isinstance(v,tuple)})
    out[n].update(ground=hexc(ground),card=hexc(card),ink=hexc(ink),dground=hexc(dground),dcard=hexc(dcard))
json.dump(out,open("palettes.json","w"),indent=1)
for n,v in out.items(): print(n, v["logo"], v["primary"], v["ui"], v["dprimary"], v["ink"], v["dground"])
