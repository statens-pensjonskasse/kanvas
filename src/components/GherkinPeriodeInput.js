import React from "react";

import Colorparser from "../parsers/CSVColorparser"
import GherkinTidslinjeparser from "../parsers/GherkinTidslinjeparser";

export default class PeriodeInput extends React.Component {
    constructor(props) {
        super(props);
        this.setTidslinjer = props.setTidslinjer;
        this.setColors = props.setColors;
        this.handleChange = this.handleChange.bind(this);
        this.input = React.createRef();

        this.tidslinjeparser = new GherkinTidslinjeparser();

        this.colorparser = new Colorparser({
            delimiter: ";"
        });

        this.hardkodet = [

            "Bakgrunn: Fellesinformasjon for alle eksemplene nedover",
            "",
            "Eksemplene nedover benytter alle seg av følgende informasjon om medlemmet som polisene tilhører.",
            "",
            "Gitt et medlemsunderlag med følgende tidslinjer:",
            "| ------------------------------ | ------------------------ |",
            "| Tidslinje                      | Person                   |",
            "|                                |                          |",
            "| Tidslinjeperiode               | #1                       |",
            "| Fra og med-dato                | 1960.01.01               |",
            "| Til og med-dato                | 2079.12.31               |",
            "| Dødsdato                       | 2080.01.01               |",
            "| PersonId                       | 1960010155555            |",
            "| ------------------------------ | ------------------------ |",
            "| Tidslinje                      | Avtaleunderlag           |",
            "| Avtalenummer                   | 200001                   |",
            "|                                |                          |",
            "| Tidslinjeperiode               | #1                       |",
            "| Fra og med-dato                | 1917.01.01               |",
            "| Til og med-dato                |                          |",
            "| Avtalenummer                   | 200001                   |",
            "| Oppsattavtale                  | 200001                   |",
            "| Pensjonsavtale                 | 200011                   |",
            "| Pensjonsavtale fra oppsatt     | 200011                   |",
            "| Pensjonsordning                | 3010                     |",
            "| Forhåndsfinansiering av AFP    | Ingen år                 |",
            "| ------------------------------ | ------------------------ |",
            "| Tidslinje                      | Avtaleunderlag           |",
            "| Avtalenummer                   | 200003                   |",
            "|                                |                          |",
            "| Tidslinjeperiode               | #1                       |",
            "| Fra og med-dato                | 1917.01.01               |",
            "| Til og med-dato                |                          |",
            "| Avtalenummer                   | 200003                   |",
            "| Oppsattavtale                  | 200001                   |",
            "| Pensjonsavtale                 | 200011                   |",
            "| Pensjonsavtale fra oppsatt     | 200011                   |",
            "| Pensjonsordning                | 3010                     |",
            "| Forhåndsfinansiering av AFP    | Ingen år                 |",
            "| ------------------------------ | ------------------------ |",
            "| Tidslinje                      | Avtaleunderlag           |",
            "| Avtalenummer                   | 300000                   |",
            "|                                |                          |",
            "| Tidslinjeperiode               | #1                       |",
            "| Fra og med-dato                | 1917.01.01               |",
            "| Til og med-dato                |                          |",
            "| Avtalenummer                   | 300000                   |",
            "| Oppsattavtale                  | 200001                   |",
            "| Pensjonsavtale                 | 200011                   |",
            "| Pensjonsavtale fra oppsatt     | 200011                   |",
            "| Pensjonsordning                | 3010                     |",
            "| Forhåndsfinansiering av AFP    | Ingen år                 |",
            "| ------------------------------ | ------------------------ |",
            "  Scenariomal: Regel - Isolert polisegrad skal være lik stillingens stillingsstørrelse avrundet til nærmeste hele prosent",
            "",
            "    Gitt at medlemsunderlaget også inneholder følgende tidslinjer:",
            "      | -------------------------- | ------------------------ |",
            "      | Tidslinje                  | Stillingsforholdunderlag |",
            "      | Stillingsforholdnummer     | 1                        |",
            "      |                            |                          |",
            "      | Tidslinjeperiode           | #1                       |",
            "      | Fra og med-dato            | 1990.01.01               |",
            "      | Til og med-dato            | 1999.12.31               |",
            "      | Stillingsforholdnummer     | 1                        |",
            "      | Deltidsjustert årslønn     | kr 600 000               |",
            "      | Stillingsstørrelse         | <Stillingsstørrelse>     |",
            "      | -------------------------- | ------------------------ |",
            "      | Tidslinje                  | Avtalekobling            |",
            "      | Stillingsforholdnummer     | 1                        |",
            "      |                            |                          |",
            "      | Tidslinjeperiode           | #1                       |",
            "      | Fra og med-dato            | 1990.01.01               |",
            "      | Til og med-dato            | 1999.12.31               |",
            "      | Stillingsforholdnummer     | 1                        |",
            "      | Avtalenummer               | 300000                   |",
            "      | Pensjonsavtale             | 200011                   |",
            "      | Pensjonsavtale fra oppsatt | 200011                   |",
            "      | -------------------------- | ------------------------ |",
            "",
            "    Når isolerte poliser utledes",
            "",
            "    Så skal følgende poliseversjoner ha blitt utledet:",
            "      | -------------------------- | -------------------- | ---------- | ---------- |",
            "      | Tidslinje                  | Polise               |            |            |",
            "      |                            |                      |            |            |",
            "      | Tidslinjeperiode           | #1                   | #2         | #3         |",
            "      | Fra og med-dato            | 1990.01.01           | 2000.01.01 | 2080.01.01 |",
            "      | Til og med-dato            | 1999.12.31           | 2079.12.31 |            |",
            "      | PoliseId                   | 1                    | 1          | 1          |",
            "      | Polisestatus               | Aktiv                | Oppsatt    | Død        |",
            "      | Ordningsgruppe             | 3010                 |            |            |",
            "      | Avtale for reserve         | 300000               |            |            |",
            "      | Oppsattavtale              | 200001               |            |            |",
            "      | Pensjonsavtale             | 200011               |            |            |",
            "      | Pensjonsavtale fra oppsatt | 200011               |            |            |",
            "      | Stillingsforholdnummer     | 1                    |            |            |",
            "      | Isolert polisegrad         | <Isolert polisegrad> | 100%       | 100%       |",
            "      | -------------------------- | -------------------- | ---------- | ---------- |",
            "",
            "    Eksempler:",
            "      | Stillingsstørrelse | Isolert polisegrad |",
            "      | 0.000%             | 0%                 |",
            "      | 200.000%           | 200%               |",
            "      | 100.000%           | 100%               |",
            "      | 50.000%            | 50%                |",
            "      | 30.444%            | 30%                |",
            "      | 70.555%            | 71%                |",
            "",
            "Polise;color;blue"
        ]
    }

    componentDidMount() {
        this.parseCurrent()
    }

    parseCurrent() {
        this.parseContent(this.input.current.value)
    }

    parseContent(rawString) {
        const content = rawString
            .split(/\r?\n/)
            .map(rad => rad.trim());

        this.setTidslinjer(
            this.tidslinjeparser.parse(content)
        )
        this.setColors(
            this.colorparser.parse(content)
        )
    }

    handleChange(event) {
        event.preventDefault();
        this.parseCurrent();
    }

    render() {
        return (
            <React.Fragment>
                <form onChange={this.handleChange} >
                    <label>
                        <textarea
                            className="gherkin-input"
                            autoFocus
                            type="text"
                            spellCheck="false"
                            ref={this.input}
                            placeholder="Gherkin"
                            defaultValue={this.hardkodet.join("\n")}
                        />
                    </label>
                </form>
                <div className="csv-hint">?</div>
            </React.Fragment>

        );
    }
}