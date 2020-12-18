import React from "react";
import ReactTooltip from 'react-tooltip';

import Periodeparser from "../domain/Periodeparser"
import Colorparser from "../domain/Colorparser"

export default class PeriodeInput extends React.Component {
    constructor(props) {
        super(props);
        this.setPerioder = props.setPerioder;
        this.setColors = props.setColors;
        this.handleChange = this.handleChange.bind(this);
        this.input = React.createRef();

        this.delimiter = ";"
        this.fraOgMedIndex = 1
        this.tilOgMedIndex = 2
        this.identifikatorIndex = 0

        this.periodeparser = new Periodeparser({
            delimiter: this.delimiter,
            fraOgMedIndex: this.fraOgMedIndex,
            tilOgMedIndex: this.tilOgMedIndex,
            identifikatorIndex: this.identifikatorIndex
        });

        this.colorparser = new Colorparser({
            delimiter: this.delimiter
        });

        this.hardkodet = [
            "Polise 1;1.1.2000;31.12.2005;Aktiv;_100%",
            "Polise 1;1.1.2006;31.12.2006;Oppsatt",
            "Polise 1;1.1.2007;          ;Aktiv;_100%",
            "",
            "Polise 2;1.1.2010;          ;Aktiv;_100%",
            "",
            "# Farging av tidslinjer",
            "Polise 2;COLOR;blue"
        ]
    }

    componentDidMount() {
        this.parseCurrent()
    }

    parseCurrent() {
        const content = this.input.current.value
            .split(/\r?\n/)
            .filter(rad => !rad.startsWith("#"))
            .map(rad => rad.trim());

        this.setPerioder(
            this.periodeparser.parse(content)
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
        const csvHintArray = new Array(Math.max(this.fraOgMedIndex, this.tilOgMedIndex, this.identifikatorIndex)).fill("___")
        csvHintArray[this.identifikatorIndex] = "[Identifikator]"
        csvHintArray[this.fraOgMedIndex] = "[Fra og med]"
        csvHintArray[this.tilOgMedIndex] = "[Til og med]"

        const periodeHint = "CSV-format for tidsperioder: " + csvHintArray.join(this.delimiter)
        const colorHint = "CSV-format for farger: [Identifikator];color;[farge]"

        return (
            <React.Fragment>
                <form onChange={this.handleChange}>
                    <label>
                        <textarea
                            className="csv-input"
                            autoFocus
                            type="text"
                            spellCheck="false"
                            ref={this.input}
                            placeholder={`Legg inn tidsperioder med ${periodeHint}`}
                            defaultValue={this.hardkodet.join("\n")}
                        />
                    </label>
                </form>
                <div className="csv-hint" data-tip={[periodeHint, colorHint].join("<br><br>")}>?</div>
                <ReactTooltip multiline />
            </React.Fragment>

        );
    }
}