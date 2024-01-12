const listaPokemon = document.querySelector("#listaPokemon");
const botonesHeader = document.querySelectorAll(".btn-header");
const botonPelea = document.querySelector("#boton-pelea");

let ENDPOINT = "https://pokeapi.co/api/v2/pokemon/";

let pokemonSeleccionados = [];

function obtenerNumeroAleatorio() {
    return Math.floor(Math.random() * 386) + 1; 
}

function obtenerPokemonAleatorio() {
    const numeroAleatorio = obtenerNumeroAleatorio();

    fetch(ENDPOINT + numeroAleatorio)
        .then((response) => response.json())
        .then(data => mostrarPokemon(data));
}

obtenerPokemonAleatorio();

function mostrarPokemon(poke) {
    let tipos = poke.types.map((type) => `<p class="${type.type.name} tipo">${type.type.name}</p>`);
    tipos = tipos.join('');

    let pokeId = poke.id.toString().padStart(3, '0');

    const div = document.createElement("div");
    div.classList.add("pokemon");
    div.dataset.id = pokeId;

    div.innerHTML = `
        <p class="pokemon-id-back">#${pokeId}</p>
        <div class="pokemon-imagen">
            <img src="${poke.sprites.other["official-artwork"].front_default}" alt="${poke.name}">
        </div>
        <div class="pokemon-info">
            <div class="nombre-contenedor">
                <p class="pokemon-id">#${pokeId}</p>
                <h2 class="pokemon-nombre">${poke.name}</h2>
            </div>
            <div class="pokemon-tipos">
                ${tipos}
            </div>
            <div class="pokemon-stats">
                <p class="stat">Weight: ${poke.weight}kg</p>
                <p class="stat">Attack: ${poke.stats[1].base_stat}</p>
                <p class="stat">Defense: ${poke.stats[2].base_stat}</p>
            </div>
        </div>
    `;
    listaPokemon.append(div);

    div.addEventListener("click", () => toggleSeleccion(div));
}

const inputCantidadPokemons = document.getElementById("cantidad-pokemons");
const botonBuscarCantidad = document.getElementById("buscar-cantidad");

botonBuscarCantidad.addEventListener("click", () => {
    const cantidadIngresada = inputCantidadPokemons.value;
    if (cantidadIngresada) {
        buscarPokemonsAleatorios(cantidadIngresada);
    } else {
        alert("Por favor, ingresa la cantidad de Pokémon que deseas buscar.");
    }
});

async function buscarPokemonsAleatorios(cantidad) {
    try {
        listaPokemon.innerHTML = ""; 

        for (let i = 0; i < cantidad; i++) {
            const pokemon = await obtenerPokemonAleatorio();
            if (pokemon) {
                mostrarPokemon(pokemon);
            } else {
               
            }
        }

        mostrarBotonPelea();
    } catch (error) {
       
    }
}


async function obtenerPokemon(id) {
    const urlCompleta = `${ENDPOINT}${parseInt(id)}`;

    try {
        const response = await fetch(urlCompleta);

        if (!response.ok) {
            throw new Error(`Error al obtener el Pokémon con ID ${id}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error en obtenerPokemon para ${urlCompleta}: ${error.message}`);
        return null;
    }
}


function obtenerEstadistica(pokemon, statName) {
    const stat = pokemon.stats.find(stat => stat.stat.name === statName);
    return stat ? stat.base_stat : 0;
}


botonesHeader.forEach(boton => boton.addEventListener("click", (event) => {
    const botonId = event.currentTarget.id;

    listaPokemon.innerHTML = "";
    pokemonSeleccionados = [];

    for (let i = 1; i <= 386; i++) {
        fetch(ENDPOINT + i)
            .then((response) => response.json())
            .then(data => {

                if (botonId === "ver-todos") {
                    mostrarPokemon(data);
                } else {
                    const tipos = data.types.map(type => type.type.name);
                    if (tipos.some(tipo => tipo.includes(botonId))) {
                        mostrarPokemon(data);
                    }
                }

            })
    }
}));

document.getElementById("ver-todos").addEventListener("click", obtenerPokemonAleatorio);


function toggleSeleccion(pokemonDiv) {
    const pokemonId = pokemonDiv.dataset.id;

    const index = pokemonSeleccionados.indexOf(pokemonId);

    if (index === -1 && pokemonSeleccionados.length < 2) {
        pokemonSeleccionados.push(pokemonId);
        pokemonDiv.style.backgroundColor = "lightgreen";
    } else if (index !== -1) {
        pokemonSeleccionados.splice(index, 1);
        pokemonDiv.style.backgroundColor = "";
    }

    if (pokemonSeleccionados.length === 2) {
        botonPelea.removeAttribute("disabled");
    } else {
        botonPelea.setAttribute("disabled", "true");
    }
}

botonPelea.addEventListener("click", () => {
    if (pokemonSeleccionados.length === 2) {
        botonPelea.setAttribute("disabled", "true");
        combatir();
    } else {
        alert("Selecciona exactamente dos Pokémon para el combate.");
    }
});


async function combatir() {
    try {
        if (pokemonSeleccionados.length === 2) {
            const [idAtacante, idDefensor] = pokemonSeleccionados;
            const atacante = await obtenerPokemon(idAtacante);
            const defensor = await obtenerPokemon(idDefensor);

            if (atacante && defensor) {
                const ataqueAtacante = await obtenerEstadistica(atacante, 'attack');
                const defensaDefensor = await obtenerEstadistica(defensor, 'defense');

                determinarGanadorCombate(atacante, defensor, ataqueAtacante, defensaDefensor);
            } else {
                alert("Error al obtener información de los Pokémon seleccionados.");
            }
        } else {
            alert("Selecciona exactamente dos Pokémon para el combate.");
        }
    } catch (error) {
        
    }
}

function determinarGanadorCombate(atacante, defensor, ataqueAtacante, defensaDefensor) {
    let resultadoCombate = "";

    if (ataqueAtacante > defensaDefensor) {
        resultadoCombate = `Sale victorioso el pokemon ${atacante.name}`;
    } else if (ataqueAtacante < defensaDefensor) {
        resultadoCombate = `Sale victorioso el pokemon ${defensor.name}`;
    } else {
        resultadoCombate = "Combate terminado en empate";
    }

    alert(resultadoCombate);
}
