import s from './index.module.scss';
import { InputGroup, Col, FormControl, Button, Row, Container } from 'react-bootstrap';
import { CURRENCIES } from '../constants';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Select from 'react-select';

export async function getStaticProps() {
  const res = await fetch(`http://api.exchangeratesapi.io/v1/latest?access_key=53da8b5961ebf53ec19e6b0558dba7fd`)
  const rates = await res.json();
  return {
    props: {
      exchangeRates: rates.rates || null,
      lastUpdated: new Date(Date.now()).toUTCString()
    },
    revalidate: 3600,
  }
}

export default function Home({ exchangeRates, lastUpdated }) {
  const { query } = useRouter();
  let sourceCur, destinationCur = ''
  
  if (typeof window !== "undefined") {
    sourceCur = localStorage.getItem('src') || false;
    destinationCur = localStorage.getItem('dest') || false;
  }
  
  const [sourceCurrency, setSourceCurrency] = useState(query?.src?.toUpperCase() || sourceCur || 'EUR');
  const [destinationCurrency, setDestinationCurrency] = useState(query?.dest?.toUpperCase() || destinationCur || 'INR');
  const [sourceValue, setSourceValue] = useState(1);
  const [destinationValue, setDestinationValue] = useState(0);
  const [currencyList, setCurrencyList] = useState([]);

  useEffect(() => {
    const list = []
    Object.keys(CURRENCIES).map(key => {
      const obj = { label: CURRENCIES[key], value: key };
      list.push(obj);
    });
    setCurrencyList(list);
  }, [])

  useEffect(() => {
    calculateExchangeRate(sourceValue)
  }, [destinationCurrency, sourceCurrency])

  const calculateExchangeRate = (e) => {
    if (sourceCurrency !== 'Currency' && destinationCurrency !== 'Currency') {
      setSourceValue(e)
      setDestinationValue(parseFloat(e * (exchangeRates[destinationCurrency] / exchangeRates[sourceCurrency])).toFixed(2))
    } else {
      alert('Please Select Currencies')
    }
  }

  const toggleCurrencies = () => {
    localStorage.setItem('src', sourceCurrency);
    localStorage.setItem('dest', destinationCurrency);
    const src = sourceCurrency;
    const srcVal = sourceValue;
    setSourceCurrency(destinationCurrency);
    setDestinationCurrency(src);
    setSourceValue(destinationValue);
    setDestinationValue(srcVal);
  }

  return (
  <div className={s.exchangeContainer}>
  {
    destinationValue && 
    <title>{sourceCurrency} {sourceValue} → {destinationCurrency} {destinationValue}</title>
  }
      <div className={s.exchangeBox}>
        <h1 className={`text-center ${s.heading}`}>Currency Exchange Rates</h1>
        <div className={`mx-auto ${s.form}`}>
          <InputGroup className={`${s.inputContainer} mb-3 input-group-lg`}>
            <Container>
              <Row>
                <Col>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Select
                    hideSelectedOptions={false}
                    isClearable={true}
                    onChange={e => {
                      setSourceCurrency(e.value);
                      localStorage.setItem('src', e.value)
                    }}
                    options={currencyList}
                    placeholder={sourceCurrency}
                    tabSelectsValue={false}
                    value={sourceCurrency}
                  />
                </Col>
                <Col>
                  <FormControl
                    type="number"
                    value={sourceValue}
                    onChange={(e) => calculateExchangeRate(e.target.value)} />
                </Col>
              </Row>
            </Container>
          </InputGroup>
          <InputGroup className={`${s.inputContainer} mb-3 input-group-lg`}>
            <Container>
              <Row>
                <Col>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Select
                    hideSelectedOptions={false}
                    isClearable={true}
                    onChange={e => {
                      setDestinationCurrency(e.value);
                      localStorage.setItem('dest', e.value)
                    }}
                    options={currencyList}
                    placeholder={destinationCurrency}
                    tabSelectsValue={false}
                    value={destinationCurrency}
                  />
                </Col>
                <Col>
                  <FormControl
                    value={destinationValue}
                    disabled />
                </Col>
              </Row>
            </Container>
          </InputGroup>
          <Button variant="dark mt-5" onClick={toggleCurrencies}>Toggle Currencies</Button>
        </div>
        <div className={s.footer}>
          <small>Last Updated: {lastUpdated}</small> <br />
          
        </div>
      </div>
    </div>
  )
}
