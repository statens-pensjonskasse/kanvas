#!groovy
@Library('spk-jenkins-lib')
d = dockerRunner('ITO-TeamSterope@spk.no')
d.build()

if (env.BRANCH_NAME == 'develop') {
    String[] deploy2env = ["kpt"]
    d.dockerDeployToTest( 'dev', deploy2env )
}

if ( env.BRANCH_NAME == 'master') {
    String[] deploy2env = ["lyn"]
    d.dockerDeployToTest( 'preprod', deploy2env )

    msg = d.dockerProdsetting( 'rhr,msu,lro,ohe,isb' )
}