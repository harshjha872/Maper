'use strict';



const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {

    date = new Date();
    id = (Date.now() + '').slice(-10);
    constructor(coords, distance, duration) {
        this.coords = coords; //[lat , lng]
        this.distance = distance;
        this.duration = duration;
    }
    _discriptionMethod() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.discription = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
    }
}

class Running extends Workout {
    type = 'running';
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._discriptionMethod();
    }

    calcPace() {
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

class Cycling extends Workout {
    type = 'cycling';
    constructor(coords, distance, duration, ElevationGain) {
        super(coords, distance, duration);
        this.ElevationGain = ElevationGain;
        this.calcSpeed();
        this._discriptionMethod();
    }

    calcSpeed() {
        this.speed = this.duration / (this.distance / 60);
        return this.speed;
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////
class App {

    #map;
    #mapEvent;
    #workouts = [];
    constructor() {
        this._getPosition();
        form.addEventListener('submit', e => this._newWorkout(e));
        inputType.addEventListener('change', this._toggleElevationField);
        containerWorkouts.addEventListener('click', this._moveToWorkout.bind(this))
    }

    _moveToWorkout(e) {
        const workoutEl = e.target.closest('.workout');
        const workoutCurrent = this.#workouts.find(curr => curr.id === workoutEl.dataset.id);
        this.#map.setView(workoutCurrent.coords, 13, {
            animate: true,
            pan: {
                duration: 1
            }
        })
    }
    _getPosition() {
        navigator.geolocation.getCurrentPosition(position => this._loadMap(position), err => alert(err.message));
    }

    _loadMap(position) {
        const { latitude: lat, longitude: lng } = position.coords;

        this.#map = L.map('map').setView([lat, lng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        //map's event listner function
        this.#map.on('click', mapArg => this._showForm(mapArg));
    }

    _showForm(mapArg) {
        //coordinates of the position where clicked is stored in this.#mapEvent 
        this.#mapEvent = mapArg;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(e) {
        e.preventDefault();

        //to make workout available to outer scope
        let workout;
        const checkNum = (...inputs) => inputs.every(ele => Number.isFinite(ele));
        const checkNegative = (...inputs) => inputs.every(ele => ele > 0)
        const { lat, lng } = this.#mapEvent.latlng;
        const Type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;

        //check if the data is correct for running
        if (Type === 'running') {
            const cadence = +inputCadence.value;

            if (!checkNum(distance, duration, cadence) || !checkNegative(distance, duration, cadence))
                return alert('invalid input')

            //Made an object which store the distance,duration etc and type
            workout = new Running([lat, lng], distance, duration, cadence);
        }

        //check if the data is correct for cycling
        if (Type === 'cycling') {
            const elevation = +inputElevation.value;

            if (!checkNum(distance, duration, elevation) || !checkNegative(distance, duration, elevation))
                return alert('invalid input')

            //Made an object which store the distance,duration etc and type    
            workout = new Cycling([lat, lng], distance, duration, elevation);
        }

        //push this new workout to an array
        this.#workouts.push(workout);

        //Show marker
        this._showMarker(workout);

        //render workout to the list of workouts
        this._renderWorkouts(workout);

        inputDistance.value = inputElevation.value = inputDuration.value = inputCadence.value = '';
    }

    _showMarker(workout) {
        L.marker(workout.coords).addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth: 250,
                minWidth: 70,
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`
            }))
            .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}${workout.discription}`)
            .openPopup();
    }

    _renderWorkouts(workout) {

        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
         <h2 class="workout__title">${workout.discription}</h2>
            <div class="workout__details">
             <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
             <span class="workout__value">${workout.distance}</span>
             <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
             <span class="workout__icon">⏱</span>
             <span class="workout__value">${workout.duration}</span>
             <span class="workout__unit">min</span>
            </div>`;

        if (workout.type === 'running') {
            html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
        }

        if (workout.type === 'cycling') {
            html += `
            <div class="workout__details">
             <span class="workout__icon">⚡️</span>
             <span class="workout__value">${workout.speed.toFixed(1)}</span>
             <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
             <span class="workout__icon">⛰</span>
             <span class="workout__value">${workout.ElevationGain}</span>
             <span class="workout__unit">m</span>
            </div>
        </li>`;
        }
        form.classList.add('hidden')
        form.insertAdjacentHTML('afterend', html)
    }
}

const app = new App();