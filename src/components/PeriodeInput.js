import React from "react";
import ReactTooltip from 'react-tooltip';

import Tidslinjeparser from "../domain/Tidslinjeparser"
import Colorparser from "../domain/Colorparser"

export default class PeriodeInput extends React.Component {
    constructor(props) {
        super(props);
        this.setTidslinjer = props.setTidslinjer;
        this.setColors = props.setColors;
        this.handleChange = this.handleChange.bind(this);
        this.handlePaste = this.handlePaste.bind(this);
        this.input = React.createRef();

        this.delimiter = ";"
        this.fraOgMedIndex = 1
        this.tilOgMedIndex = 2
        this.identifikatorIndex = 0

        this.tidslinjeparser = new Tidslinjeparser({
            delimiter: this.delimiter,
            fraOgMedIndex: this.fraOgMedIndex,
            tilOgMedIndex: this.tilOgMedIndex,
            identifikatorIndex: this.identifikatorIndex
        });

        this.colorparser = new Colorparser({
            delimiter: this.delimiter
        });

        this.hardkodet = [
            "Stillingsforhold 1;2000;;Konduktør;_100%",
            "Stillingsforhold 1;2006;2010;Konduktør;_100%",
            "",
            "Stillingsforhold 2;2010;;Lokomotivfører 🚂;_100%",
            "",
            "# Farging av tidslinjer",
            "Stillingsforhold 2;COLOR;blue"
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
            .filter(rad => !rad.startsWith("#"))
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

    handlePaste(event) {
        // fjerner doble newlines ved paste (Miro legger inn ekstra newlines i tekst)
        const doubleNewline = /^\n\n/gm;
        let paste = (event.clipboardData || window.clipboardData).getData('text');
        const doubleNewlines = paste.match(doubleNewline) || [];
        if (doubleNewlines.length > 0) {
            console.log('yarp')
            paste = paste.replace(/\n\n/gm, '\n')
            paste = paste.replace(doubleNewline, '\n')
            this.input.current.value = paste;
            this.parseContent(paste)
            event.preventDefault()
        }
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
                <form onChange={this.handleChange} onPaste={this.handlePaste}>
                    <label>
                        <textarea
                            className="csv-input"
                            autoFocus
                            type="text"
                            spellCheck="false"
                            ref={this.input}
                            placeholder={`${periodeHint}`}
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