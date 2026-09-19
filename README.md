# 한입지도

기존 사진 앨범과 독립된 HTML·CSS·JavaScript 맛집 검색 사이트입니다. Sites를 사용하지 않습니다.

## 실행

이 폴더에서 `python -m http.server 8080`을 실행하고 `http://localhost:8080`에 접속합니다.
키 없이도 검색어 입력 후 카카오맵 검색 결과 링크를 이용할 수 있습니다. 가상의 맛집 데이터는 표시하지 않습니다.

## 실제 지도 연결

1. https://developers.kakao.com 에서 앱을 생성하고 카카오맵 사용 설정을 확인합니다.
2. 앱의 JavaScript 키에 사용할 SDK 도메인(`http://localhost:8080`, 배포 시 실제 도메인)을 등록합니다.
3. `config.js`의 `kakaoJavaScriptKey`에 JavaScript 키를 입력합니다. 브라우저용 키이며 REST API 키나 Admin 키를 넣으면 안 됩니다.
4. 새로고침하면 지도, 음식점 검색, 결과별 마커, 페이지 이동, 전화 및 카카오맵 상세보기 기능이 활성화됩니다.

공식 안내: https://apis.map.kakao.com/web/guide/

검색은 카카오 장소 검색의 음식점 분류(FD6)를 사용합니다. 평점·영업시간·사진 등 API가 제공하지 않는 정보는 만들지 않습니다. 카카오맵 상세보기에서 확인하세요.

키가 없거나 지도 연결에 실패하면 카카오맵 링크로 검색을 이어갑니다. 실제 API 연결 검증에는 유효한 키와 등록된 도메인이 필요합니다.

# local
