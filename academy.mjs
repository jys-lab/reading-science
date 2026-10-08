export function academyInfo(search) {
  const params = new URLSearchParams(search);
  const name = (params.get('name') || '').trim().slice(0,40);
  const tel = (params.get('tel') || '').trim().slice(0,25);
  return {name,tel,call: phoneNumber(tel)};
}
export function phoneNumber(value) {
  if (!value || !/^\+?[0-9 ()-]+$/.test(value)) return '';
  const number = value.replace(/[ ()-]/g,'');
  return /^\+?\d{7,15}$/.test(number) ? number : '';
}
export function academyLink(base,name,tel) {
  const url = new URL(base);
  url.search = ''; url.hash = '';
  name = name.trim().slice(0,40); tel = tel.trim().slice(0,25);
  if (!name) return '';
  url.searchParams.set('name',name);
  if (tel) url.searchParams.set('tel',tel);
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
    const result = byId('link-result');
    function refresh() {
      const tel = telInput.value.trim();
      const invalid = tel && !phoneNumber(tel);
      telInput.setCustomValidity(invalid ? '연락처를 확인해 주세요. 숫자와 하이픈으로 입력할 수 있습니다.' : '');
      byId('phone-error').hidden = !invalid;
      const url = invalid ? '' : academyLink(location.href,nameInput.value,tel);
      result.hidden = !url;
      byId('generated-link').value = url;
      byId('preview-link').href = url || '#';
      byId('copy-status').textContent = '';
    }
    nameInput.addEventListener('input',refresh);
    telInput.addEventListener('input',refresh);
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
