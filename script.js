document.addEventListener("DOMContentLoaded", function() {
  $('#sessionDate').persianDatepicker({
    format: 'YYYY/MM/DD',
    initialValue: false,
  });
  loadSessionDataFromLocalStorage(); // بارگذاری داده‌ها از Local Storage هنگام لود شدن صفحه
});

// آبجکت برای ذخیره داده‌های هر فرد و جلسات مربوط به آن
const sessionData = {};

// تابع ذخیره برنامه
function saveProgram() {
  const selectedName = document.getElementById('nameDropdown').value;
  if (!selectedName) {
    alert('لطفاً یک نام انتخاب کنید.');
    return;
  }

  const studentName = document.getElementById('studentName').value;
  const sessionDate = document.getElementById('sessionDate').value;
  const exercises = [];
  const rows = document.querySelectorAll("#exerciseTableBody tr");

  rows.forEach((row) => {
    const exercise = row.children[0].querySelector("input").value;
    const repet = row.children[1].querySelector("input").value;
    const weight = row.children[2].querySelector("input").value;
    const rest = row.children[3].querySelector("input").value;

    if (exercise || repet || weight || rest) {
      exercises.push({ exercise, repet, weight, rest });
    }
  });

  if (!sessionData[selectedName]) {
    sessionData[selectedName] = [];
  }

  // حداکثر 1000 جلسه برای هر فرد
  if (sessionData[selectedName].length >= 1000) {
    alert('حداکثر 1000 جلسه برای این نام ذخیره شده است.');
    return;
  }

  sessionData[selectedName].push({ studentName, sessionDate, exercises });
  localStorage.setItem('sessionData', JSON.stringify(sessionData));
  alert(`برنامه برای "${selectedName}" ذخیره شد!`);
  loadSessionList();
}

// تابع بارگذاری لیست جلسات
function loadSessionList() {
  const selectedName = document.getElementById('nameDropdown').value;
  const sessionSelect = document.getElementById('sessionSelect');
  sessionSelect.innerHTML = ''; // خالی کردن کشو جلسات

  if (sessionData[selectedName]) {
    sessionData[selectedName].forEach((session, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `جلسه ${index + 1}: ${session.sessionDate}`;
      sessionSelect.appendChild(option);
    });
  }
}

// تابع بارگذاری جلسه خاص
function loadSpecificSession() {
  const selectedName = document.getElementById('nameDropdown').value;
  const sessionIndex = document.getElementById('sessionSelect').value;

  if (sessionIndex !== '') {
    const data = sessionData[selectedName][sessionIndex];
    document.getElementById('studentName').value = data.studentName || '';
    document.getElementById('sessionDate').value = data.sessionDate || '';

    const tableBody = document.getElementById("exerciseTableBody");
    tableBody.innerHTML = '';

    data.exercises.forEach((exercise) => {
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td><input type="text" value="${exercise.exercise}"></td>
        <td><input type="text" value="${exercise.repet}" class="small-input"oninput="autoResize(this)"></td>
        <td><input type="text" value="${exercise.weight}" class="weight-input"oninput="autoResize(this)"></td>
        <td><input type="text" value="${exercise.rest}" class="rest-input" oninput="autoResize(this)"></td>
        <td><button type="button" id="deleteButton"onclick="removeRow(this)"></button></td>
      `;
      tableBody.appendChild(newRow);
    });

    alert(`برنامه "${selectedName}" بارگذاری شد.`);
  }
}

function editSession() {
  const selectedName = document.getElementById('nameDropdown').value;
  const sessionIndex = document.getElementById('sessionSelect').value;

  if (selectedName && sessionIndex !== '') {
    const studentName = document.getElementById('studentName').value;
    const sessionDate = document.getElementById('sessionDate').value;
    const exercises = [];
    const rows = document.querySelectorAll("#exerciseTableBody tr");

    rows.forEach((row) => {
      const exercise = row.children[0].querySelector("input").value;
      const repet = row.children[1].querySelector("input").value;
      const weight = row.children[2].querySelector("input").value;
      const rest = row.children[3].querySelector("input").value;

      if (exercise || repet || weight || rest) {
        exercises.push({ exercise, repet, weight, rest });
      }
    });

    // به‌روزرسانی جلسه با اطلاعات جدید
    sessionData[selectedName][sessionIndex] = {
      studentName,
      sessionDate,
      exercises
    };

    // ذخیره‌سازی در Local Storage
    localStorage.setItem('sessionData', JSON.stringify(sessionData));
    alert(`جلسه ${parseInt(sessionIndex) + 1} ویرایش شد.`);
    loadSessionList(); // بروزرسانی لیست جلسات
  } else {
    alert("لطفاً یک جلسه انتخاب کنید.");
  }
}

function removeSession() {
  const selectedName = document.getElementById('nameDropdown').value;
  const sessionIndex = document.getElementById('sessionSelect').value;

  if (selectedName && sessionIndex !== '') {
    sessionData[selectedName].splice(sessionIndex, 1); // حذف جلسه
    localStorage.setItem('sessionData', JSON.stringify(sessionData));
    loadSessionList(); // بروزرسانی فهرست جلسات
    alert(`جلسه ${parseInt(sessionIndex) + 1} حذف شد.`);
  } else {
    alert("لطفاً یک جلسه انتخاب کنید.");
  }
}

// بارگذاری داده‌ها از Local Storage هنگام لود شدن صفحه
window.onload = function() {
  const storedData = localStorage.getItem('sessionData');
  if (storedData) {
    Object.assign(sessionData, JSON.parse(storedData));
  }
  loadNames(); // بارگذاری نام‌ها
  loadSessionList(); // بارگذاری لیست جلسات
  loadExercises(); // بارگذاری لیست حرکات
  // اضافه کردن event listener برای کشو نام
  document.getElementById('nameDropdown').addEventListener('change', function() {
    const selectedName = this.value;
    loadNameData(selectedName); // بارگذاری اطلاعات مربوط به نام انتخاب شده
    loadSessionData(); // بارگذاری جلسات مربوط به نام انتخاب شده
  });

  // بارگذاری اطلاعات برای اولین نام (اگر وجود داشته باشد)
  const firstName = Object.keys(sessionData)[0];
  if (firstName) {
    document.getElementById('nameDropdown').value = firstName;
    loadNameData(firstName);
    loadSessionData();
  }
};

// تابع بارگذاری اطلاعات برای نام خاص
function loadNameData(selectedName) {
  const data = sessionData[selectedName];

  if (data) {
    document.getElementById('studentName').value = data.studentName || '';
    document.getElementById('sessionDate').value = data.sessionDate || '';

    const tableBody = document.getElementById("exerciseTableBody");
    tableBody.innerHTML = ''; // خالی کردن جدول

    data.exercises.forEach((exercise) => {
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td><input type="text" value="${exercise.exercise}"></td>
        <td><input type="text" value="${exercise.repet}" class="small-input"oninput="autoResize(this)"></td>
        <td><input type="text" value="${exercise.weight}" class="weight-input"oninput="autoResize(this)"></td>
        <td><input type="text" value="${exercise.rest}" class="rest-input" oninput="autoResize(this)"></td>
        <td><button type="button" id="deleteButton"onclick="removeRow(this)"></button></td>
      `;
      tableBody.appendChild(newRow);
    });

    alert(`اطلاعات ${selectedName} بارگذاری شد.`);
  } else {
    alert("هیچ اطلاعاتی برای این نام ذخیره نشده است.");
  }
}

// تابع بارگذاری جلسه‌ها برای نام انتخاب شده
function loadSessionData() {
  const selectedName = document.getElementById('nameDropdown').value;
  const sessionSelect = document.getElementById('sessionSelect');
  sessionSelect.innerHTML = ''; // خالی کردن کشو انتخاب جلسه

  if (sessionData[selectedName]) {
    sessionData[selectedName].forEach((session, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `جلسه ${index + 1}: ${session.sessionDate}`;
      sessionSelect.appendChild(option);
    });
  } else {
    alert("هیچ جلسه‌ای برای این نام موجود نیست.");
  }
}

function loadNames() {
  const nameDropdown = document.getElementById('nameDropdown');
  nameDropdown.innerHTML = ''; // خالی کردن کشو قبل از بارگذاری

  // بارگذاری نام‌ها از sessionData
  for (const name in sessionData) {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    nameDropdown.appendChild(option);
  }
}

function loadProgram() {
  const selectedName = document.getElementById('nameDropdown').value;
  if (!selectedName) {
    alert('لطفاً یک نام انتخاب کنید.');
    return;
  }

  const data = sessionData[selectedName];

  if (data) {
    document.getElementById('studentName').value = data.studentName || '';
    document.getElementById('sessionDate').value = data.sessionDate || '';

    const tableBody = document.getElementById("exerciseTableBody");
    tableBody.innerHTML = ''; // خالی کردن جدول

    data.exercises.forEach((exercise) => {
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td><input type="text" value="${exercise.exercise}"></td>
        <td><input type="text" value="${exercise.repet}" class="small-input"oninput="autoResize(this)"></td>
        <td><input type="text" value="${exercise.weight}" class="weight-input"oninput="autoResize(this)"></td>
        <td><input type="text" value="${exercise.rest}" class="rest-input" oninput="autoResize(this)"></td>
        <td><button type="button" id="deleteButton"onclick="removeRow(this)"></button></td>
      `;
      tableBody.appendChild(newRow);
    });

    alert(`برنامه "${selectedName}" بارگذاری شد.`);
  } else {
    alert("هیچ اطلاعاتی برای این نام ذخیره نشده است.");
  }
}

function autoResize(input) {
  // تنظیم عرض ورودی به اندازه طول متن
  input.style.width = '50px'; // ابتدا عرض را به خودکار تنظیم کن
  input.style.width = (input.scrollWidth) + 'px'; // سپس عرض را به اندازه محتوای واقعی تنظیم کن
}

function deleteExercise() {
  const exerciseName = document.getElementById('exerciseName').value;
  const exerciseLabel = document.getElementById('exerciseLabel').value;
  const exerciseDropdown = document.getElementById('exerciseDropdown');

  // اگر فقط label پر باشد، حذف کنیم
  if (exerciseLabel) {
    for (let i = 0; i < exerciseDropdown.options.length; i++) {
      if (exerciseDropdown.options[i].text === exerciseLabel) { // مقایسه بر اساس متن
        exerciseDropdown.remove(i); // حذف گزینه
        break;
      }
    }
    // پاک کردن ورودی label بعد از حذف
    document.getElementById('exerciseLabel').value = '';
  }

  // اگر نام حرکت پر باشد، حذف کنیم
  if (exerciseName) {
    for (let i = 0; i < exerciseDropdown.options.length; i++) {
      if (exerciseDropdown.options[i].value === exerciseName) { // مقایسه بر اساس value
        exerciseDropdown.remove(i); // حذف گزینه
        break;
      }
    }
    // پاک کردن ورودی‌ها بعد از حذف
    document.getElementById('exerciseName').value = '';
  }
}

function addRow() {
  const tableBody = document.getElementById("exerciseTableBody");
  const newRow = document.createElement("tr");
  newRow.innerHTML = `
    <td><input type="text" placeholder="حرکت"></td>
    <td><input type="text" placeholder="تکرار" class="small-input"oninput="autoResize(this)"></td>
    <td><input type="text" placeholder="وزنه" class="weight-input"oninput="autoResize(this)"></td>
    <td><input type="text" placeholder="استراحت" class="rest-input" oninput="autoResize(this)"></td>
    <td><button type="button" id="deleteButton"onclick="removeRow(this)"></button></td>
  `;
  tableBody.appendChild(newRow);
  
  // تنظیم عرض ورودی‌ها برای ردیف جدید
  const repetInput = newRow.querySelector('.small-input');
  const weightInput = newRow.querySelector('.weight-input');
  const restInput = newRow.querySelector('.rest-input');

  autoResize(repetInput); // تنظیم عرض ورودی تکرار
  autoResize(weightInput); // تنظیم عرض ورودی وزنه
  autoResize(restInput); // تنظیم عرض ورودی استراحت
}

function removeRow(button) {
  const row = button.parentNode.parentNode; // به ردیف والد دسترسی پیدا کن
  row.parentNode.removeChild(row); // ردیف را حذف کن
}

function saveExerciseData() {
  const sessionSelect = document.getElementById('sessionSelect').value;
  const studentName = document.getElementById('studentName').value;
  const sessionDate = document.getElementById('sessionDate').value;
  const exercises = [];
  const rows = document.querySelectorAll("#exerciseTableBody tr");

  rows.forEach((row) => {
    const exercise = row.children[0].querySelector("input").value;
    const repet = row.children[1].querySelector("input").value;
    const weight = row.children[2].querySelector("input").value;
    const rest = row.children[3].querySelector("input").value;

    if (exercise || repet || weight || rest) {
      exercises.push({
        exercise,
        repet,
        weight,
        rest
      });
    }
  });

  sessionData[sessionSelect] = {
    studentName,
    sessionDate,
    exercises,
    namesList: [...namesList] // ذخیره نام‌ها
  };

  // ذخیره داده‌ها در Local Storage
  localStorage.setItem('sessionData', JSON.stringify(sessionData));
  alert("برنامه تمرینی برای " + sessionSelect + " ذخیره شد!");
}

function loadNameData(selectedName) {
  const data = sessionData[selectedName];

  if (data) {
    document.getElementById('studentName').value = data.studentName || '';
    document.getElementById('sessionDate').value = data.sessionDate || '';

    const tableBody = document.getElementById("exerciseTableBody");
    tableBody.innerHTML = ''; // خالی کردن جدول

    data.exercises.forEach((exercise) => {
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td><input type="text" value="${exercise.exercise}"></td>
        <td><input type="text" value="${exercise.repet}" class="small-input"oninput="autoResize(this)"></td>
        <td><input type="text" value="${exercise.weight}" class="weight-input"oninput="autoResize(this)"></td>
        <td><input type="text" value="${exercise.rest}" class="rest-input" oninput="autoResize(this)"></td>
        <td><button type="button" id="deleteButton"onclick="removeRow(this)"></button></td>
      `;
      tableBody.appendChild(newRow);
    });

    alert(`اطلاعات ${selectedName} بارگذاری شد.`);
  } else {
    alert("هیچ اطلاعاتی برای این نام ذخیره نشده است.");
  }
}
function deleteSelectedName() {
  const nameDropdown = document.getElementById('nameDropdown');
  const selectedName = nameDropdown.value;

  if (!selectedName) {
    alert('لطفاً یک نام انتخاب کنید.');
    return;
  }

  if (confirm(`آیا مطمئن هستید که می‌خواهید "${selectedName}" را حذف کنید؟`)) {
    // حذف نام از sessionData
    delete sessionData[selectedName];

    // حذف نام از namesList
    const index = namesList.indexOf(selectedName);
    if (index > -1) {
      namesList.splice(index, 1);
    }

    // بروزرسانی کشو نام‌ها
    loadNames();

    // بارگذاری داده‌های جلسه‌ها
    loadSessionData();

    alert(`نام "${selectedName}" با موفقیت حذف شد.`);
  }
}

function saveAllData() {
  const allData = {
    sessionData: {},
    namesList: namesList,
  };

  for (const name of namesList) {
    if (sessionData[name]) {
      allData.sessionData[name] = sessionData[name];
    }
  }

  localStorage.setItem('programData', JSON.stringify(allData));
  alert("تمام داده‌ها با موفقیت ذخیره شد!");
}

function loadAllData() {
  const savedData = localStorage.getItem('programData');

  if (savedData) {
    const allData = JSON.parse(savedData);
    namesList = allData.namesList || [];
    Object.assign(sessionData, allData.sessionData);

    loadNames(); // بارگذاری نام‌ها
    loadSessionData(); // بارگذاری جلسات برای اولین نام
    alert("داده‌ها با موفقیت بارگذاری شدند!");
  } else {
    alert("هیچ داده‌ای برای بارگذاری وجود ندارد.");
  }
}

// تابع بارگذاری داده‌ها برای نام خاص
function loadNameData(name, data) {
  document.getElementById('studentName').value = data.studentName || '';
  document.getElementById('sessionDate').value = data.sessionDate || '';

  const tableBody = document.getElementById("exerciseTableBody");
  tableBody.innerHTML = ''; // خالی کردن جدول

  data.exercises.forEach((exercise) => {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td><input type="text" value="${exercise.exercise}"></td>
      <td><input type="text" value="${exercise.repet}" class="small-input"oninput="autoResize(this)"></td>
      <td><input type="text" value="${exercise.weight}" class="weight-input"oninput="autoResize(this)"></td>
      <td><input type="text" value="${exercise.rest}" class="rest-input" oninput="autoResize(this)"></td>
      <td><button type="button" id="deleteButton"onclick="removeRow(this)"></button></td>
    `;
    tableBody.appendChild(newRow);
  });
}

function downloadPDF() {
  const element = document.getElementById('student-program');
  
  const options = {
    margin: 0, // حذف حاشیه
    filename: 'exercise-program.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' } // تنظیم فرمت به A4
  };

  html2pdf()
    .from(element)
    .set(options)
    .save();
}

const exercisesList = JSON.parse(localStorage.getItem('exercisesList')) || [];

document.getElementById('addExerciseButton').addEventListener('click', function() {
    const exerciseName = document.getElementById('exerciseName').value.trim();
    const exerciseLabel = document.getElementById('exerciseLabel').value.trim();
    const exerciseDropdown = document.getElementById('exerciseDropdown');

    if (exerciseName && exerciseLabel) {
        // بررسی وجود گزینه با همین نام در گروه
        let optGroup = [...exerciseDropdown.childNodes].find(optGroup => optGroup.label === exerciseLabel);
        let optionExists = false;

        if (optGroup) {
            optionExists = [...optGroup.childNodes].some(option => option.value === exerciseName);
        }

        if (!optionExists) {
            // ایجاد گزینه جدید
            const newOption = document.createElement('option');
            newOption.value = exerciseName;
            newOption.textContent = exerciseName;

            // اگر گروه وجود ندارد، ایجاد یک گروه جدید
            if (!optGroup) {
                optGroup = document.createElement('optgroup');
                optGroup.label = exerciseLabel;
                exerciseDropdown.appendChild(optGroup);
            }

            // اضافه کردن گزینه جدید به گروه
            optGroup.appendChild(newOption);

            // ذخیره نام و لیبل در آرایه و Local Storage
            exercisesList.push({ name: exerciseName, label: exerciseLabel });
            localStorage.setItem('exercisesList', JSON.stringify(exercisesList));

            // پاک کردن ورودی‌ها
            document.getElementById('exerciseName').value = '';
            document.getElementById('exerciseLabel').value = '';

            alert(`حرکت "${exerciseName}" با لیبل "${exerciseLabel}" با موفقیت اضافه شد!`);
        } else {
            alert('این حرکت قبلاً به این لیبل اضافه شده است.');
        }
    } else {
        alert('لطفاً نام حرکت و لیبل را وارد کنید.');
    }
});

function loadExercises() {
    const exercisesList = JSON.parse(localStorage.getItem('exercisesList')) || [];
    const exerciseDropdown = document.getElementById('exerciseDropdown');

    exercisesList.forEach(exercise => {
        let optGroup = [...exerciseDropdown.childNodes].find(optGroup => optGroup.label === exercise.label);
        
        if (!optGroup) {
            optGroup = document.createElement('optgroup');
            optGroup.label = exercise.label;
            exerciseDropdown.appendChild(optGroup);
        }

        const newOption = document.createElement('option');
        newOption.value = exercise.name;
        newOption.textContent = exercise.name;
        optGroup.appendChild(newOption);
    });
}

function addExercise() {
  const dropdown = document.getElementById('exerciseDropdown');
  const selectedValue = dropdown.value;

  if (selectedValue) {
    const tableBody = document.getElementById("exerciseTableBody");
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
      <td><input type="text" value="${selectedValue}" readonly></td>
      <td><input type="text" placeholder="تکرار" class="small-input"oninput="autoResize(this)"></td>
      <td><input type="text" placeholder="وزنه" class="weight-input"oninput="autoResize(this)"></td>
      <td><input type="text" placeholder="استراحت" class="rest-input" oninput="autoResize(this)"></td>
      <td><button type="button" id="deleteButton"onclick="removeRow(this)"></button></td>
    `;

    tableBody.appendChild(newRow);
    dropdown.value = ""; // خالی کردن کشو بعد از اضافه کردن
    
      // تنظیم عرض ورودی‌ها برای ردیف جدید
    const repetInput = newRow.querySelector('.small-input');
    const weightInput = newRow.querySelector('.weight-input');
    const restInput = newRow.querySelector('.rest-input');

    autoResize(repetInput); // تنظیم عرض ورودی تکرار
    autoResize(weightInput); // تنظیم عرض ورودی وزنه
    autoResize(restInput); // تنظیم عرض ورودی استراحت
  } else {
    alert('لطفا یک حرکت انتخاب کنید.');
  }
}

const namesList = []; // برای ذخیره لیست نام‌ها

function addName(event) {
    event.preventDefault(); // جلوگیری از ارسال فرم
    const nameInput = document.getElementById('addName');
    const nameValue = nameInput.value.trim();

    if (!nameValue) {
        alert('لطفاً نامی وارد کنید.'); // بررسی خالی بودن ورودی
        return;
    }

    if (namesList.includes(nameValue)) {
        alert('این نام قبلاً افزوده شده است.'); // بررسی وجود نام
        return;
    }

    namesList.push(nameValue);
    const dropdown = document.getElementById('nameDropdown');

    const newOption = document.createElement('option');
    newOption.value = nameValue;
    newOption.textContent = nameValue;

    dropdown.appendChild(newOption); // اضافه کردن نام به کشو
    alert(`نام "${nameValue}" با موفقیت افزوده شد!`);
    nameInput.value = ''; // خالی کردن ورودی بعد از افزودن
}
document.getElementById('nameDropdown').addEventListener('change', loadSessionData);
function loadSessionData() {
  const selectedName = document.getElementById('nameDropdown').value;
  const sessionSelect = document.getElementById('sessionSelect');
  sessionSelect.innerHTML = ''; // خالی کردن کشو انتخاب جلسه

  if (sessionData[selectedName]) {
    sessionData[selectedName].forEach((session, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `جلسه ${index + 1}: ${session.sessionDate}`;
      sessionSelect.appendChild(option);
    });
  } else {
    alert("هیچ جلسه‌ای برای این نام موجود نیست.");
  }
}