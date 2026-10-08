export function academyInfo(search) {
  const params = new URLSearchParams(search);
  const name = (params.get('name') || '').trim().slice(0,40);
  const tel = (params.get('tel') || '').trim().slice(0,25);
  const purpose = params.get('purpose') === 'seminar' ? 'seminar' : 'class';
  const when = (params.get('when') || '').trim().slice(0,80);
  const place = (params.get('place') || '').trim().slice(0,120);
  return {name,tel,call: phoneNumber(tel),purpose,when,place};
}
export function phoneNumber(value) {
  if (!value || !/^\+?[0-9 ()-]+$/.test(value)) return '';
  const number = value.replace(/[ ()-]/g,'');
  return /^\+?\d{7,15}$/.test(number) ? number : '';
}
export function academyLink(base,name,tel,event={}) {
  const url = new URL(base);
  url.search = ''; url.hash = '';
  name = name.trim().slice(0,40); tel = tel.trim().slice(0,25);
  if (!name) return '';
  url.searchParams.set('name',name);
  if (tel) url.searchParams.set('tel',tel);
  if (event.purpose === 'seminar') {
    const when = (event.when || '').trim().slice(0,80);
    const place = (event.place || '').trim().slice(0,120);
    if (!when || !place) return '';
    url.searchParams.set('purpose','seminar');
    url.searchParams.set('when',when);
    url.searchParams.set('place',place);
  }
  return url.href;
}
if (typeof document !== 'undefined') {
  const byId = id => document.getElementById(id);
  const info = academyInfo(location.search);
  if (info.name) {
    byId('link-maker').hidden = true;
    byId('academy-banner').hidden = false;
    byId('banner-name').textContent = info.name;
    byId('academy-contact').hidden = false;
    byId('contact-name').textContent = info.name;
    document.title = `${info.name} | 리딩과학 안내`;
    if (info.purpose === 'seminar' && info.when && info.place) {
      byId('seminar-card').hidden = false;
      byId('seminar-academy').textContent = info.name;
      byId('seminar-when').textContent = info.when;
      byId('seminar-place').textContent = info.place;
      byId('banner-caption').textContent = '리딩과학 학부모 설명회 안내';
      byId('contact-caption').textContent = '리딩과학 설명회 참석 문의';
      byId('contact-note').textContent = '설명회 참석과 자세한 안내는 학원에 문의해 주세요.';
      document.title = `${info.name} | 리딩과학 설명회 안내`;
    }
    if (info.call) {
      byId('contact-phone').textContent = info.tel;
      byId('contact-phone').href = `tel:${info.call}`;
      byId('contact-phone').hidden = false;
      byId('call-action').href = `tel:${info.call}`;
      byId('call-action').hidden = false;
      byId('sticky-call').href = `tel:${info.call}`;
      byId('sticky-call').textContent = `${info.name} 상담 전화`;
      byId('sticky-call').hidden = false;
      document.body.classList.add('has-call');
    }
  } else {
    byId('link-maker').hidden = false;
    const nameInput = byId('academy-input');
    const telInput = byId('phone-input');
    const purposeInput = byId('purpose-input');
    const whenInput = byId('seminar-when-input');
    const placeInput = byId('seminar-place-input');
    const result = byId('link-result');
    function refresh() {
      const seminar = purposeInput.value === 'seminar';
      byId('seminar-fields').hidden = !seminar;
      whenInput.required = placeInput.required = seminar;
      byId('seminar-hint').hidden = !seminar || !!(whenInput.value.trim() && placeInput.value.trim());
      const tel = telInput.value.trim();
      const invalid = tel && !phoneNumber(tel);
      telInput.setCustomValidity(invalid ? '연락처를 확인해 주세요. 숫자와 하이픈으로 입력할 수 있습니다.' : '');
      byId('phone-error').hidden = !invalid;
      const url = invalid ? '' : academyLink(location.href,nameInput.value,tel,{purpose:purposeInput.value,when:whenInput.value,place:placeInput.value});
      result.hidden = !url;
      byId('generated-link').value = url;
      byId('preview-link').href = url || '#';
      byId('copy-status').textContent = '';
    }
    nameInput.addEventListener('input',refresh);
    telInput.addEventListener('input',refresh);
    purposeInput.addEventListener('change',refresh);
    whenInput.addEventListener('input',refresh);
    placeInput.addEventListener('input',refresh);
    byId('academy-form').addEventListener('submit',event=>{event.preventDefault();refresh();});
    byId('copy-link').addEventListener('click',async()=>{
      const field = byId('generated-link');
      if (!field.value) return;
      try {
        await navigator.clipboard.writeText(field.value);
        byId('copy-status').textContent = '복사했습니다. 이 링크를 학부모님께 보내 주세요.';
      } catch {
        field.focus();field.select();
        byId('copy-status').textContent = '링크를 선택했습니다. 길게 누르거나 복사 메뉴로 복사해 주세요.';
      }
    });
    refresh();
  }
}
