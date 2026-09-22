const TOKEN='0x1Ba42e5193dfA8B03D15dd1B86a3113bbBEF8Eeb';
const BSC={chainId:'0x38',chainName:'BNB Smart Chain',nativeCurrency:{name:'BNB',symbol:'BNB',decimals:18},rpcUrls:['https://bsc-dataseed.binance.org/'],blockExplorerUrls:['https://bscscan.com/']};
const state={account:null,rate:null};
const referenceNFTs=[
  {collection:'cyphers',id:1},{collection:'cyphers',id:2},{collection:'cyphers',id:3},{collection:'cyphers',id:4},
  {collection:'shielded',id:1138},{collection:'shielded',id:1192},{collection:'shielded',id:1692},{collection:'shielded',id:1881},{collection:'shielded',id:2303},{collection:'shielded',id:2856},
  {collection:'pixel-punks',id:211},{collection:'pixel-punks',id:273},{collection:'pixel-punks',id:552},{collection:'pixel-punks',id:725},{collection:'pixel-punks',id:794},{collection:'pixel-punks',id:1196}
];

function nftCard(nft){
  const image=`assets/collection-images/${nft.collection}-${nft.id}.png`;
  return `<article class="nft-card reference-nft image-only-card" data-collection="${nft.collection}" data-name="${nft.collection} ${nft.id}"><div class="nft-art"><img src="${image}" alt="NFT collection artwork" decoding="async"></div></article>`;
}

function renderCards(){
  document.querySelector('#featuredGrid').innerHTML=referenceNFTs.slice(4,12).map(nftCard).join('');
  document.querySelector('#collectionGrid').innerHTML=referenceNFTs.map(nftCard).join('');
}

function showView(view){
  if(!document.querySelector(`[data-view-panel="${view}"]`)) view='discover';
  document.querySelectorAll('.view').forEach(el=>el.classList.toggle('active',el.dataset.viewPanel===view));
  document.querySelectorAll('#railNav a').forEach(el=>el.classList.toggle('active',el.dataset.view===view));
  window.scrollTo({top:0,behavior:'instant'});
}
function route(){showView(location.hash.slice(1)||'discover')}
window.addEventListener('hashchange',route);
document.querySelectorAll('[data-route]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();location.hash=a.dataset.route}));

function toast(msg){const el=document.querySelector('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2600)}

async function connectWallet(){
  if(!window.ethereum){toast('No EVM wallet detected');return}
  try{
    const accounts=await window.ethereum.request({method:'eth_requestAccounts'});
    let chain=await window.ethereum.request({method:'eth_chainId'});
    if(chain.toLowerCase()!==BSC.chainId){
      try{await window.ethereum.request({method:'wallet_switchEthereumChain',params:[{chainId:BSC.chainId}]})}
      catch(err){if(err.code===4902)await window.ethereum.request({method:'wallet_addEthereumChain',params:[BSC]});else throw err}
    }
    state.account=accounts[0];
    const short=`${state.account.slice(0,6)}…${state.account.slice(-4)}`;
    document.querySelector('#connectBtn').textContent=short;
    document.querySelector('#profileAddress').textContent=state.account;
    document.querySelector('#profileConnect').textContent='Wallet connected';
    toast('Connected to BNB Chain');
  }catch(err){toast(err?.message||'Wallet connection cancelled')}
}
document.querySelector('#connectBtn').addEventListener('click',connectWallet);
document.querySelector('#profileConnect').addEventListener('click',connectWallet);

async function loadRate(){
  try{
    const res=await fetch(`https://api.dexscreener.com/latest/dex/tokens/${TOKEN}`);
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const data=await res.json();
    const pairs=(data.pairs||[]).filter(p=>p.chainId==='bsc'&&p.dexId==='pancakeswap'&&p.quoteToken?.symbol==='WBNB');
    pairs.sort((a,b)=>(b.liquidity?.usd||0)-(a.liquidity?.usd||0));
    if(!pairs[0])throw new Error('No ZEC/WBNB pool');
    state.rate=Number(pairs[0].priceNative);
    document.querySelector('#rateText').textContent=`1 ZEC ≈ ${state.rate.toFixed(4)} BNB`;
    updateQuote();
  }catch(e){document.querySelector('#rateText').textContent='Live rate unavailable';}
}
function updateQuote(){
  const amount=Number(document.querySelector('#bnbAmount').value);
  document.querySelector('#zecAmount').value=state.rate&&Number.isFinite(amount)&&amount>0?(amount/state.rate).toFixed(6):'';
}
document.querySelector('#bnbAmount').addEventListener('input',updateQuote);
document.querySelector('#flipBtn').addEventListener('click',()=>toast('This market entry route is BNB → ZEC only'));
document.querySelector('#copyToken').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(TOKEN);toast('ZEC address copied')}catch{toast(TOKEN)}});

const snippets={
svg:`function tokenSVG(uint256 tokenId) public view returns (string memory) {\n  return string.concat(\n    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">',\n    '<rect width="600" height="600" fill="#0b0b0c"/>',\n    renderTraits(tokenId),\n    '</svg>'\n  );\n}`,
metadata:`function tokenURI(uint256 tokenId) public view override returns (string memory) {\n  string memory image = Base64.encode(bytes(tokenSVG(tokenId)));\n  string memory json = Base64.encode(bytes(string.concat(\n    '{"name":"Unicash #', tokenId.toString(),\n    '","image":"data:image/svg+xml;base64,', image, '"}'\n  )));\n  return string.concat('data:application/json;base64,', json);\n}`,
market:`BUYER\n  │ approve exact ZEC amount\n  ▼\nMARKETPLACE CONTRACT\n  ├─ verifies listing + seller + deadline\n  ├─ transfers ZEC buyer → seller / royalty\n  └─ transfers NFT seller → buyer\n\nNo native BNB sale path. No fabricated privacy claim.`
};
document.querySelectorAll('[data-demo]').forEach(b=>b.addEventListener('click',()=>{document.querySelector('#codePreview').textContent=snippets[b.dataset.demo]}));

document.querySelector('#themePulse').addEventListener('click',()=>document.body.classList.toggle('ambient'));
const searchDialog=document.querySelector('#searchDialog');
document.querySelector('#searchBtn').addEventListener('click',()=>searchDialog.showModal());
window.addEventListener('keydown',e=>{if(e.key==='/'&&!/input|textarea/i.test(document.activeElement.tagName)){e.preventDefault();searchDialog.showModal()}});
document.querySelector('#globalSearch').addEventListener('input',e=>{const q=e.target.value.toLowerCase();const hits=[['SVG collections','collections'],['Swap BNB for ZEC','swap'],['Protocol architecture','protocol'],['Creator studio','studio']].filter(x=>x[0].toLowerCase().includes(q));document.querySelector('#searchResults').innerHTML=q?hits.map(x=>`<a href="#${x[1]}" onclick="document.querySelector('#searchDialog').close()" style="display:block;padding:10px 0;border-bottom:1px solid #29292d">${x[0]} →</a>`).join('')||'<p>No matching section</p>':'<p>Try “SVG”, “ZEC”, “Swap” or “Protocol”</p>'});
let galleryCollection='all';
function applyGalleryFilter(){
  const q=document.querySelector('#collectionFilter').value.trim().toLowerCase();
  document.querySelectorAll('#collectionGrid .reference-nft').forEach(card=>{
    const matchesCollection=galleryCollection==='all'||card.dataset.collection===galleryCollection;
    card.hidden=!(matchesCollection&&card.dataset.name.includes(q));
  });
}
document.querySelector('#collectionFilter').addEventListener('input',applyGalleryFilter);
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  galleryCollection=button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(item=>item.classList.toggle('active',item===button));
  applyGalleryFilter();
}));

renderCards();route();loadRate();
