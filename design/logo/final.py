import re
CORAL="#1C7B5A"; INK="#141D19"
def vpill(cx,w,h,cy=128):
    r=w/2; x=cx-r; y1=cy-h/2+r; y2=cy+h/2-r
    return f"M{x} {y1} A{r} {r} 0 0 1 {x+w} {y1} V{y2} A{r} {r} 0 0 1 {x} {y2} Z"
def stadium(x,y,w,h):
    r=w/2; return f"M{x} {y+r} A{r} {r} 0 0 1 {x+w} {y+r} V{y+h-r} A{r} {r} 0 0 1 {x} {y+h-r} Z"
sym=" ".join([stadium(80,52,96,152)]+[vpill(x,14,h) for x,h in [(106,52),(128,96),(150,68)]]+[vpill(62,20,64),vpill(34,20,32),vpill(194,20,64),vpill(222,20,32)])
small=" ".join([stadium(72,40,112,176)]+[vpill(x,20,h) for x,h in [(112,72),(144,104)]]+[vpill(46,24,72),vpill(210,24,72)])
def doc(vb,body,title="Sniptape"): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}"><title>{title}</title>{body}</svg>'
P=lambda d,fill: f'<path fill="{fill}" fill-rule="evenodd" d="{d}"/>'
open("final/sniptape-symbol.svg","w").write(doc("0 0 256 256",P(sym,CORAL)))
open("final/sniptape-symbol-black.svg","w").write(doc("0 0 256 256",P(sym,"#000")))
open("final/sniptape-symbol-small.svg","w").write(doc("0 0 256 256",P(small,CORAL)))
wm=open("wordmark.svg").read(); w=int(re.search(r'viewBox="0 0 (\d+) 256"',wm).group(1)); wd=re.search(r' d="([^"]+)"',wm).group(1)
open("final/sniptape-wordmark.svg","w").write(doc(f"0 0 {w} 256",P(wd,INK)))
W=256+16+w
open("final/sniptape-horizontal.svg","w").write(doc(f"0 0 {W} 256",P(sym,CORAL)+f'<g transform="translate(272,0)">{P(wd,INK)}</g>'))
s=0.62; ww=w*s; H=256+8+256*s
off=(max(ww,256)-256)/2; WS=max(ww,256)
open("final/sniptape-stacked.svg","w").write(doc(f"0 0 {WS:.0f} {H-30:.0f}",f'<g transform="translate({off:.1f},0)">{P(sym,CORAL)}</g><g transform="translate({(WS-ww)/2:.1f},{256-60}) scale({s})">{P(wd,INK)}</g>'))
