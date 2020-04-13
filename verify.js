document.getElementById("doDirect").addEventListener("click",
  function() {
    if (document.getElementById("doDirect").checked) {
      document.getElementById("NumeratorEntry").innerHTML = '<td><label for="f-numerator">Numerator: </label></td>' +
      '<td><input type="number" name="numerator" id="f-numerator" placeholder="1.0" step="0.01"/></td>'+
      '<td><label id="Numerator"></label></td>';
      document.getElementById("DivisorEntry").innerHTML = '<td><label for="f-divisor">Divisor: </label></td>'+
      '<td><input type="number" name="divisor" id="f-divisor" placeholder="3.14159265358979" step="0.01"/></td>'+
      '<td><label id="Numerator"></label></td>';
      document.getElementById("DirectEntry").innerHTML = "";
    } else {
      document.getElementById("NumeratorEntry").innerHTML = "";
      document.getElementById("DivisorEntry").innerHTML = "";
      document.getElementById("DirectEntry").innerHTML = '<td"><label for="f-num">Number: </label></td>'+
      '<td><input type="number" name="num" id="f-numb" placeholder="0.36787944117"/></td>' +
      '<td><label id="Num"></label></td>';
    }
  }
);

document.getElementById("btn-submit").addEventListener("click",
  function() {
    var numerator = document.getElementById("f-numerator");
    var divisor = document.getElementById("f-divisor");
    var numb = document.getElementById("f-numb");
    if (numb != null && numb.value > 0 && numb.value < 1) {
      document.getElementById("safeCheck").value = numb.value;
    }
    else if (numerator != null && divisor != null && numerator.value/divisor.value < 1 && numerator.value/divisor.value > 0) {
      document.getElementById("safeCheck").value = numerator.value/divisor.value;
    }
    else {
      document.getElementById("safeCheck").value = "unSafe";
      alert("Please enter values such that the total value is between 0 and 1");
    }
  }
);