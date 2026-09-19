(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  let map, places, info, markers = [], requestId = 0;
  const query = $('query');
  const status = $('status');
  const external = $('external-search');
  function linkFor(text) { return 'https://map.kakao.com/link/search/' + encodeURIComponent(text); }
  function clear() {
    markers.forEach(marker => marker.setMap(null)); markers = [];
    if (info) info.close();
    $('results').replaceChildren(); $('pagination').replaceChildren(); $('count').textContent = '';
  }
  function select(place, marker, row) {
    document.querySelectorAll('.result').forEach(item => item.classList.remove('selected'));
    row.classList.add('selected');
    const content = document.createElement('div'); content.className = 'info-window'; content.textContent = place.place_name;
    info.setContent(content); info.open(map, marker); map.panTo(marker.getPosition());
  }
  function render(data, pagination) {
    const bounds = new kakao.maps.LatLngBounds();
    data.forEach((place, index) => {
      const position = new kakao.maps.LatLng(Number(place.y), Number(place.x));
      const marker = new kakao.maps.Marker({ map, position }); markers.push(marker); bounds.extend(position);
      const row = document.createElement('li'); row.className = 'result';
      const button = document.createElement('button'); button.type = 'button'; button.className = 'place-button';
      const number = document.createElement('span'); number.className = 'number'; number.textContent = index + 1;
      const text = document.createElement('span');
      const name = document.createElement('span'); name.className = 'place-name'; name.textContent = place.place_name;
      const category = document.createElement('span'); category.className = 'category'; category.textContent = place.category_name.split(' > ').slice(1).join(' · ');
      text.append(name, category); button.append(number, text);
      button.addEventListener('click', () => select(place, marker, row));
      kakao.maps.event.addListener(marker, 'click', () => { select(place, marker, row); row.scrollIntoView({ block: 'nearest' }); });
      const address = document.createElement('p'); address.className = 'address'; address.textContent = place.road_address_name || place.address_name;
      const details = document.createElement('div'); details.className = 'details';
      const detail = document.createElement('a'); detail.textContent = '상세보기 ↗'; detail.href = 'https://place.map.kakao.com/' + encodeURIComponent(place.id); detail.target = '_blank'; detail.rel = 'noopener noreferrer'; details.append(detail);
      if (place.phone) { const phone = document.createElement('a'); phone.textContent = place.phone; phone.href = 'tel:' + place.phone.replace(/[^\d+]/g, ''); details.append(phone); }
      row.append(button, address, details); $('results').append(row);
    });
    map.setBounds(bounds);
    $('count').textContent = pagination.totalCount + '곳';
    status.textContent = '목록을 선택하면 지도에서 위치를 확인할 수 있어요.';
    for (let page = 1; page <= pagination.last; page++) {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = page; button.setAttribute('aria-label', page + '페이지');
      if (page === pagination.current) button.setAttribute('aria-current', 'page');
      button.addEventListener('click', () => search(page)); $('pagination').append(button);
    }
  }
  function search(page = 1) {
    const text = query.value.trim(); if (!text) { query.focus(); return; }
    external.href = linkFor(text); external.textContent = '카카오맵에서 검색 결과 보기 ↗';
    if (!places) { status.textContent = '카카오맵에서 “' + text + '” 검색 결과를 확인하세요.'; $('map-description').textContent = '“' + text + '” 검색을 카카오맵에서 이어갈 수 있어요.'; return; }
    const id = ++requestId; clear(); status.textContent = '맛집을 찾고 있어요…';
    places.keywordSearch(text, (data, resultStatus, pagination) => {
      if (id !== requestId) return;
      if (resultStatus === kakao.maps.services.Status.OK) render(data, pagination);
      else if (resultStatus === kakao.maps.services.Status.ZERO_RESULT) status.textContent = '검색 결과가 없어요. 다른 동네나 메뉴로 검색해 보세요.';
      else status.textContent = '검색을 불러오지 못했어요. 잠시 후 다시 검색해 주세요.';
    }, { category_group_code: 'FD6', size: 10, page });
  }
  $('search-form').addEventListener('submit', event => { event.preventDefault(); search(); });
  document.querySelectorAll('[data-query]').forEach(button => button.addEventListener('click', () => { query.value = button.dataset.query; search(); }));
  const key = window.MATZIP_CONFIG?.kakaoJavaScriptKey?.trim();
  if (!key) { $('connection-note').textContent = '현재는 카카오맵 바로가기를 이용할 수 있어요. 사이트 내 지도는 연결 준비 중입니다.'; return; }
  let finished = false;
  const fail = () => { if (finished) return; finished = true; $('connection-note').textContent = '지도를 연결하지 못했어요. 카카오맵 바로가기를 이용해 주세요.'; };
  const timeout = setTimeout(fail, 15000);
  const script = document.createElement('script'); script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=' + encodeURIComponent(key) + '&libraries=services&autoload=false';
  script.onerror = () => { clearTimeout(timeout); fail(); };
  script.onload = () => {
    if (!window.kakao?.maps) { fail(); return; }
    kakao.maps.load(() => {
      if (finished) return;
      try {
        map = new kakao.maps.Map($('map'), { center: new kakao.maps.LatLng(37.5445, 127.0557), level: 5 });
        places = new kakao.maps.services.Places(); info = new kakao.maps.InfoWindow({ zIndex: 3 });
        finished = true; clearTimeout(timeout); $('map-message').hidden = true;
        new ResizeObserver(() => { const center = map.getCenter(); map.relayout(); map.setCenter(center); }).observe($('map'));
        if (query.value.trim()) search();
      } catch { fail(); }
    });
  };
  document.head.append(script);
})();
