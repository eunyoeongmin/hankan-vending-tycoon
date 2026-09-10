from pathlib import Path
root=Path(__file__).resolve().parent
base=(root/'src/base.html').read_text(encoding='utf-8')
engine=(root/'src/enterprise.js').read_text(encoding='utf-8')+'\n'+(root/'src/rivalry.js').read_text(encoding='utf-8')+'\n'+(root/'src/scenario.js').read_text(encoding='utf-8')
engine+='\n'+(root/'src/market.js').read_text(encoding='utf-8')
engine+='\n'+(root/'src/trade.js').read_text(encoding='utf-8')
css=(root/'src/enterprise.css').read_text(encoding='utf-8')
marker="render();if(loadWarning)"
assert base.count(marker)==1
out=base.replace(marker,engine+'\n'+marker).replace('</style>',css+'\n</style>',1)
(root/'dist/index.html').write_text(out,encoding='utf-8')
(root.parent/'vending-tycoon.html').write_text(out,encoding='utf-8')
notes=root/'DEVELOPMENT.md'
if notes.exists(): (root.parent/'자판기_개발메모.md').write_text(notes.read_text(encoding='utf-8-sig'),encoding='utf-8')
print('Built standalone enterprise game')
