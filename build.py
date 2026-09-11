from pathlib import Path
root=Path(__file__).resolve().parent
base=(root/'src/base.html').read_text(encoding='utf-8')
engine=(root/'src/enterprise.js').read_text(encoding='utf-8')+'\n'+(root/'src/rivalry.js').read_text(encoding='utf-8')+'\n'+(root/'src/scenario.js').read_text(encoding='utf-8')
engine+='\n'+(root/'src/market.js').read_text(encoding='utf-8')
engine+='\n'+(root/'src/industry.js').read_text(encoding='utf-8')
engine+='\n'+(root/'src/trade.js').read_text(encoding='utf-8')
engine+='\n'+(root/'src/workspace.js').read_text(encoding='utf-8')
engine+='\n'+(root/'src/office.js').read_text(encoding='utf-8')
engine+='\n'+(root/'src/industry-ui.js').read_text(encoding='utf-8')
engine+='\n'+(root/'src/expansion.js').read_text(encoding='utf-8')
engine+='\n'+(root/'src/expansion-ui.js').read_text(encoding='utf-8')
engine+='\n'+(root/'src/supply-chain.js').read_text(encoding='utf-8')
engine+='\n'+(root/'src/organization.js').read_text(encoding='utf-8')
engine+='\n'+(root/'src/supply-chain-ui.js').read_text(encoding='utf-8')
for module in ['core','operations','commerce','production','equipment','finance','market','decisions','hooks','completion','group','reporting','ui-state','ui','ui-extra']:
    engine+='\n'+(root/('src/reference-'+module+'.js')).read_text(encoding='utf-8')
for module in ['core','finance','operations','ui']:
    engine+='\n'+(root/('src/management-'+module+'.js')).read_text(encoding='utf-8')
engine+='\n'+(root/'src/desktop.js').read_text(encoding='utf-8')
engine+='\n'+(root/'src/city-art.js').read_text(encoding='utf-8')
css=(root/'src/enterprise.css').read_text(encoding='utf-8')
css+='\n'+(root/'src/workspace.css').read_text(encoding='utf-8')
css+='\n'+(root/'src/office.css').read_text(encoding='utf-8')
css+='\n'+(root/'src/reference.css').read_text(encoding='utf-8')
css+='\n'+(root/'src/desktop.css').read_text(encoding='utf-8')
css+='\n'+(root/'src/city-art.css').read_text(encoding='utf-8')
marker="render();if(loadWarning)"
assert base.count(marker)==1
out=base.replace(marker,engine+'\n'+marker).replace('</style>',css+'\n</style>',1)
(root/'dist/index.html').write_text(out,encoding='utf-8')
(root.parent/'vending-tycoon.html').write_text(out,encoding='utf-8')
notes=root/'DEVELOPMENT.md'
if notes.exists(): (root.parent/'자판기_개발메모.md').write_text(notes.read_text(encoding='utf-8-sig'),encoding='utf-8')
print('Built standalone enterprise game')
