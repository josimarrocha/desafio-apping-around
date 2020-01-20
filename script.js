function genereteMeses() {
  return Array.from({ length: 12 }).map((_, i) =>
    new moment(`1900-${i + 1}-01`).locale('pt-br')
      .format('MMMM')
      .toLowerCase()
  )
}

function regexLetra(letra) {
  return new RegExp(`${letra}`, 'g', 'i')
}

new Vue({
  el: "#app",
  data: function () {
    return {
      valueInput: '',
      mesesName: genereteMeses(),
      mesesLetrasQntd: {},
      showChart: false
    }
  },
  methods: {
    initRecord() {
      if (window.SpeechRecognition || window.webkitSpeechRecognition) {
        let Speech = window.SpeechRecognition || window.webkitSpeechRecognition
        let audio = new Speech()
        audio.lang = 'pt-br'

        audio.onresult = (e) => {
          let result = e.results[0][0].transcript
          document.querySelector('#input').value = result
          this.valueInput = result.toLowerCase()
          result = result.split('')
          this.mesesLetrasQntd = {}
          result.forEach((letra) => {
            this.encontrarMeses({ data: letra })
          })
        }
        audio.start()
      }
    },
    show() {
      this.showChart = !this.showChart
      this.valueInput = ''
      this.mesesLetrasQntd = {}
    },
    highlight(mes) {
      const valueSplit = this.valueInput.toLowerCase().split('')
      return mes
        .split('')
        .map((atual) =>
          valueSplit.includes(atual)
            ? `<span class='highlight'>${atual}</span>`
            : atual
        )
        .join('')
    },
    isNumber: function (value) {
      return typeof value === 'number'
    },
    encontrarMeses(e) {
      if (!e.data) return

      const regex = new RegExp(`[${this.valueInput}]`, 'i')
      const letraDigitada = e.data.toLowerCase()
      const letraRegex = regexLetra(letraDigitada)

      this.mesesName.forEach((mes) => {
        const mesSplit = mes.split('')
        if (!mesSplit.includes(letraDigitada)) return

        if (regex.test(mes)) {
          this.mesesLetrasQntd = {
            ...this.mesesLetrasQntd,
            [mes]: this.addLetra(letraDigitada, mes, letraRegex)
          }
        }
      })
    },
    addLetra(letra, mes, regex) {
      const newLetra = [{ [letra]: mes.match(regex).length }]
      if (this.mesesLetrasQntd[mes]) {
        if (!this.mesesLetrasQntd[mes].some((item) => item[letra])) {
          return this.mesesLetrasQntd[mes].concat(newLetra)
        }
        return this.mesesLetrasQntd[mes]
      }
      return newLetra
    },
    removeLetra(e) {
      if (e.keyCode === 8) {
        const { valueInput, mesesLetrasQntd } = this
        let valueSplit = valueInput.split('')

        for (let mes in mesesLetrasQntd) {
          let arrLetras = this.mesesLetrasQntd[mes].filter((letra) =>
            valueSplit.includes(Object.keys(letra)[0])
          )
          this.mesesLetrasQntd[mes] = arrLetras

          if (!Object.keys(mesesLetrasQntd[mes]).length) {
            delete mesesLetrasQntd[mes]
          }
        }
      }
    }
  },
  computed: {
    renderMeses() {
      if (!Object.keys(this.mesesLetrasQntd).length || this.valueInput.trim() === '') {
        return this.mesesName
      }
      return this.mesesLetrasQntd
    },
    totais() {
      const { mesesLetrasQntd } = this
      let totais = []
      Object.keys(mesesLetrasQntd).forEach((atual) => {
        mesesLetrasQntd[atual].forEach((item) => {
          let [letra, valor] = Object.entries(item)[0]
          if (totais.some((item) => item.letra === letra)) {
            totais = totais.map((item) =>
              item.letra === letra
                ? { ...item, valor: item.valor + valor }
                : item
            )
            return
          }
          totais.push({ letra, valor })
        })
      })

      totais = totais.sort((a, b) => (a.letra > b.letra ? 1 : -1))
      return totais.length ? totais : ''
    }
  }
})

const alfabeto = 'abcdefghijklmnopqrstuvwyz'
const alfabetoSplit = alfabeto.split('')
const mesesJoin = genereteMeses().join('')
const canvas = document.querySelector('#chart').getContext('2d')
new Chart(canvas, {
  type: 'bar',
  data: {
    labels: alfabetoSplit,
    datasets: [{
      label: 'QNTD',
      data: alfabetoSplit.map(letra => {
        return mesesJoin.match(regexLetra(letra)) ? mesesJoin.match(regexLetra(letra)).length : 0
      }),
      backgroundColor: alfabetoSplit.map(() => `rgb(${random(198)}, ${random(80)}, ${random(150)})`),
    }],
  }
})
function random(number) {
  return Math.floor(Math.random() * number + 50)
}