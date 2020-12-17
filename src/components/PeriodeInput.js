import React from "react";
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
            "Polise 1;2000-01-01;2005-12-31;Aktiv;_3010",
            "Polise 1;2006-01-01;2006-12-31;Oppsatt;_3010",
            "Polise 1;2007-01-01;          ;Aktiv;_3010",
            "",
            "Polise 2;2010-01-01;          ;Aktiv;_3010",
            "",
            "",
            "Polise 2;COLOR;blue"
        ]
    }

    componentDidMount() {
        this.parseCurrent()
    }

    parseCurrent() {
        this.setPerioder(
            this.periodeparser.parse(this.input.current.value)
        )
        this.setColors(
            this.colorparser.parse(this.input.current.value)
        )
    }

    handleChange(event) {
        event.preventDefault();
        this.parseCurrent();
    }

    render() {
        const exampleArray = new Array(Math.max(this.fraOgMedIndex, this.tilOgMedIndex, this.identifikatorIndex)).fill("___")
        exampleArray[this.identifikatorIndex] = "[Identifikator]"
        exampleArray[this.fraOgMedIndex] = "[Fra og med]"
        exampleArray[this.tilOgMedIndex] = "[Til og med]"
        const hint = "CSV-format: " + exampleArray.join(this.delimiter)
        return (
            <React.Fragment>
                <h4 className="csv-hint">{hint}</h4>
                <form onChange={this.handleChange}>
                    <label>
                        <textarea
                            className="csv-input"
                            type="text"
                            spellCheck="false"
                            ref={this.input}
                            placeholder={`Legg inn tidsperioder med ${hint}`}
                            defaultValue={this.hardkodet.join("\n")}
                        />
                    </label>
                </form>
            </React.Fragment>

        );
    }
}