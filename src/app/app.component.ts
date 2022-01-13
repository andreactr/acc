import { FormControl, FormGroup } from '@angular/forms';
import { Component, AfterViewInit, ElementRef, ViewChild,ViewChildren,QueryList} from '@angular/core';
import { Web3Service } from './services/web3.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('scrollframe',{static:false}) private scrollFrame!: ElementRef;
  @ViewChildren('item') itemElements!: QueryList<any>;

  private scrollContainer: any;

  title = 'Ejemplo Ethereum';
  msgEstado = 'No Conectado.';
  estado = false;
  count = 0;
  resultado = '';
  balanceOf = '';

  blockHash = '';
  blockNumber = '';
  from = '';
  transactionHash = '';

  elementos: any = [];
  elementosClient: any = [];



  cabeceras = ['Transaction Hash', 'Block Number','Valor'];



  constructor(public web3s: Web3Service){}

  cantboleto = new FormGroup({
    dircant: new FormControl('')
    });

    transboleto = new FormGroup({
      recep: new FormControl(''),
      nump: new FormControl('')
      });




  ngAfterViewInit(): void {
    this.conectar();
    this.scrollContainer = this.scrollFrame.nativeElement;
    //this.elementos.changes.subscribe(() => this.onElementosChanged());
  }

  private onElementosChanged(): void {
    this.scrollToBottom();
  }

  conectar():void {
    this.web3s.connectAccount().then((r)=>{
      this.msgEstado = "Conectado.";
      this.estado = true;
      this.subscribeToEvents();
    });
  }

  async getBalanceByAccount(accountAddress: any): Promise<any> {
    return await this.web3s.contrato.methods.balanceOf(accountAddress).call();
  }
  

  async Balance(): Promise<void> {
    const addressDapp =  this.cantboleto.get('dircant')?.value;
    console.log(addressDapp);
    const accountBalance = await this.getBalanceByAccount(addressDapp);
    console.log(`accountBalance => ${accountBalance}`);
    this.balanceOf = accountBalance;
  }

  async transferir(): Promise<void> {
    const address1 =  this.transboleto.get('recep')?.value;
    const numsgc =  this.transboleto.get('nump')?.value;
    
    this.web3s.contrato.methods.transfer(address1, numsgc).send({from: this.web3s.accounts[0]})

    .then((response:any) => {
      this.resultado = "Transacción exitosa";
      this.blockHash = response.blockHash;
      this.blockNumber = response.blockNumber;
      this.from = response.from;
      this.transactionHash = response.transactionHash;
      this.web3s.contrato.methods.approve(address1, numsgc).send({from: this.web3s.accounts[0]})
   })

   .catch((error: any) => {
      console.log(error);
      this.resultado = "Error";
   });
  }

  getCount(): void {
    this.web3s.contrato.methods.getCount().call().then((response: any) => {
                                                        this.count = response;
                                                       });
  }








  borrar(): void {
    this.blockHash = "";
    this.blockNumber = "";
    this.from = "";
    this.transactionHash = "";
  }

  increment(): void {
    this.web3s.contrato.methods.increment().send({from: this.web3s.accounts[0]})
                                           .then((response:any) => {
                                              this.resultado = "Transacción realizada!";

                                              this.blockHash = response.blockHash;
                                              this.blockNumber = response.blockNumber;
                                              this.from = response.from;
                                              this.transactionHash = response.transactionHash;
                                           })
                                           .catch((error: any) => {
                                              console.log(error);
                                              this.resultado = "Error en la transacción!";
                                           });
  }

  subscribeToEvents() {
    // Subscribe to pending transactions
    const self = this;
    this.web3s.contrato.events.ValueChanged({
                                              fromBlock: 0
                                            },
                                            (error: any, event: any) => {
                                              if (!error){
                                                // setInterval(() => {
                                                  this.elementos.push(
                                                    { blockHash: event.blockHash,
                                                      transactionHash: event.transactionHash,
                                                      blockNumber:event.blockNumber,
                                                      valor: event.returnValues.newValue
                                                    }
                                                  );
                                                // }, 500);
                                              }
                                            });

  }

  scrollToBottom() {
    this.scrollContainer.scroll({
      top: this.scrollContainer.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }
}
