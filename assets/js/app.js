$(document).ready(() => {
  $('.modal').modal();
  $('.timepicker').timepicker();
  const db = firebase.database();

  $('.modal-close').on('click', function() {
    const name = $('#trainName').val().trim();
    const destination = $('#destName').val().trim();
    const firstDeparture = $('#firstTime').val();
    const frequency = $('#freq').val().trim();

    writeData(name, destination, firstDeparture, frequency);
  });

  $(document).on('click', 'i.fas.fa-trash-alt',function() {
    const name = $(this).parent().siblings("td.name").text();
    db.ref(`trains/${name}`).remove();
  });

  const writeData = (name, dest, first, freq) => {
    db.ref(`trains/${name}`).set({
      name: name,
      firstDeparture: first,
      destination: dest,
      frequency: freq
    });
  };
  

  const getData = () => {
    db.ref(`trains/`).on('value', (snapshot) => {
      const $trainTable = $(".trainTable");
      $trainTable.empty();
      
      $.each(snapshot.val(),(index, value) => {
        let next = "";
        const firstTime = moment(value.firstDeparture, "HH:mm");
        const diff = moment().diff(moment(firstTime), "minutes");
        const frequency = parseInt(value.frequency);
        const remainder = diff % frequency;
        let remaining = frequency - remainder;
        const beforeTime = moment(firstTime).diff(moment(), "minutes");
        const beforeMinutes = Math.ceil(moment.duration(beforeTime).asMinutes());

        if ((moment() - firstTime) < 0) {
          next = value.firstDeparture;
          remaining = beforeMinutes;
        }
        else {
          next = moment().add(remaining, "minutes").format("hh:mm A");
          remaining = frequency - remainder;
        }
        const template = 
        `
        <tr>
          <td class="name">${value.name}</td>
          <td>${value.destination}</td>
          <td>${value.frequency} ${(value.frequency > 1 ? `minutes` : `minute`)}</td>
          <td>${next}</td>
          <td>${remaining} ${(value.frequency > 1 ? `minutes` : `minute`)}</td>
          <td><i class="fas fa-trash-alt"></i></td>
        </tr>
        `
        $trainTable.append($(template));
      });
    });
  };
  getData();
  setInterval(function() {
    if(moment().format("ss") === "00") {getData()};
  },1000)
});