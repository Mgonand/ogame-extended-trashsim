import type { Simulation } from '../../model/result';

function getPlanetDebrisTable() {
  const element = document.querySelectorAll(
    '.results-tables .result-table table',
  )[3];
  if (element) {
    return element as HTMLTableElement;
  }
  throw new Error('Could not find planet debris table');
}

function getResultTableDebris() {
  const element = document.querySelectorAll(
    '.result-table-debris.result-table table',
  )[0];
  if (element) {
    return element as HTMLTableElement;
  }
  throw new Error('Could not find result table debris');
}

const numberFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 0,
});

function getNumberString(n: number) {
  return numberFormatter.format(n);
}

function updateElementTextContent(element: Element, text: string | number) {
  if (typeof text === 'number') {
    element.textContent = text === 0 ? '/' : getNumberString(text);
  } else {
    element.textContent = text;
  }
}

function updateDeuteriumDebrisRowToPlanetTable(debrisDeuterium: number = 0) {
  const planetDebrisTable = getPlanetDebrisTable();
  let deuteriumDebrisRow = planetDebrisTable.querySelector(
    'tbody tr td div.resource-deuterium',
  );
  if (deuteriumDebrisRow) {
    const resultElement = planetDebrisTable.querySelector(
      '#result-debris-deuterium',
    );
    if (resultElement) {
      updateElementTextContent(resultElement, debrisDeuterium);
    }
  } else {
    const planetDebrisRows = Array.from(
      planetDebrisTable.querySelectorAll('tbody tr'),
    );
    const [metalDebrisRow, crystalDebrisRow] = planetDebrisRows;
    const moonChanceColumn = metalDebrisRow.querySelector('#result-moonchance');
    if (moonChanceColumn) {
      moonChanceColumn.setAttribute('rowspan', '3');
    }
    deuteriumDebrisRow = crystalDebrisRow.cloneNode(
      true,
    ) as typeof crystalDebrisRow;
    const deuteriumImageDiv = deuteriumDebrisRow.querySelector('td div');
    if (deuteriumImageDiv) {
      deuteriumImageDiv.classList.remove('resource-crystal');
      deuteriumImageDiv.classList.add('resource-deuterium');
    }
    const resultElement = deuteriumDebrisRow.querySelector(
      '#result-debris-crystal',
    );
    if (resultElement) {
      resultElement.id = 'result-debris-deuterium';
      updateElementTextContent(resultElement, debrisDeuterium);
    }
    crystalDebrisRow.after(deuteriumDebrisRow);
  }
}

function updateDeuteriumDebrisRowToResultTable(
  initialDeuterium: number = 0,
  attackersMinedDeuterium: number = 0,
  defendersMinedDeuterium: number = 0,
) {
  const resultDebrisTable = getResultTableDebris();
  const existsDeuteriumDiv = resultDebrisTable.querySelector(
    'tbody tr td div.resource-deuterium',
  );
  if (existsDeuteriumDiv) {
    const resultElements = resultDebrisTable.querySelectorAll(
      '#result-debris-deuterium',
    );
    if (resultElements.length > 0) {
      resultElements.forEach((resultElement, i) => {
        updateElementTextContent(
          resultElement,
          i === 0
            ? initialDeuterium
            : i === 1
              ? attackersMinedDeuterium
              : defendersMinedDeuterium,
        );
      });
    }
  } else {
    const planetDebrisRows = Array.from(
      resultDebrisTable.querySelectorAll('tbody tr'),
    );
    const [, crystalDebrisRow] = planetDebrisRows;
    const deuteriumDebrisRow = crystalDebrisRow.cloneNode(
      true,
    ) as typeof crystalDebrisRow;
    const deuteriumImageDivs = deuteriumDebrisRow.querySelectorAll('td div');
    if (deuteriumImageDivs.length > 0) {
      deuteriumImageDivs.forEach((deuteriumImageDiv) => {
        deuteriumImageDiv.classList.remove('resource-crystal');
        deuteriumImageDiv.classList.add('resource-deuterium');
      });
    }
    const resultElements = deuteriumDebrisRow.querySelectorAll(
      '#result-debris-crystal',
    );
    if (resultElements.length > 0) {
      resultElements.forEach((resultElement, i) => {
        resultElement.id = 'result-debris-deuterium';
        updateElementTextContent(
          resultElement,
          i === 0
            ? initialDeuterium
            : i === 1
              ? attackersMinedDeuterium
              : defendersMinedDeuterium,
        );
      });
    }
    crystalDebrisRow.after(deuteriumDebrisRow);
  }
}

export function updateDeuteriumDebrisRow(debris?: Simulation['debris']) {
  updateDeuteriumDebrisRowToPlanetTable(debris?.remaining.deuterium);
  updateDeuteriumDebrisRowToResultTable(
    debris?.overall.deuterium,
    debris?.reaper.attackers.deuterium,
    debris?.reaper.defenders.deuterium,
  );
}

export function updateTotalRecyclers(
  totalRecyclers: number,
  overall?: boolean,
) {
  const table = overall ? getResultTableDebris() : getPlanetDebrisTable();
  const totalRecyclersRow = table.querySelector('tfoot tr td#result-recyclers');
  if (totalRecyclersRow) {
    updateElementTextContent(totalRecyclersRow, totalRecyclers);
  }
}
