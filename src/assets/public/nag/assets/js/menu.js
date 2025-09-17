
const userIcon = document.getElementById('userIcon');
const dropdown = document.getElementById('userDropdown');

/* -----------------------------
   Submenu do usuário
------------------------------*/
if(userIcon && dropdown){
  userIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if(!userIcon.contains(e.target)){
      dropdown.classList.remove('show');
    }
  });
}

function SetDashboardName(name) {
  const boxes = document.querySelectorAll(".MunicipioInfo");
  if (!boxes) setTimeout(()=>SetDashboardName(name), 300);
  else {
    boxes.forEach(el => {
      el.innerHTML = name;
    });
  }
}

function HighlightMenu(labelName) {
    const allButtons = document.querySelectorAll('.nav-items .btn-item label');

    allButtons.forEach(label => {
        if (label.textContent.trim() === labelName) {
            label.style.fontWeight = '600';

            // Se estiver dentro de um dropdown, destacar também o botão pai "Outras Páginas"
            const dropdownContent = label.closest('.dropdown-content');
            if (dropdownContent) {
                const parentDropdownBtn = dropdownContent.previousElementSibling.querySelector('label');
                if (parentDropdownBtn) parentDropdownBtn.style.fontWeight = '600';
            }
        } else {
            label.style.fontWeight = '100';
        }
    });
}
